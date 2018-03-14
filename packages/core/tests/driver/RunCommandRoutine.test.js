import { Tool } from 'boost';
import RunCommandRoutine from '../../src/driver/RunCommandRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import JestDriver from '../../../driver-jest/src/JestDriver';
import { createDriverContext, setupMockTool, prependRoot } from '../../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('RunCommandRoutine', () => {
  let routine;
  let driver;
  let tool;

  beforeEach(() => {
    tool = setupMockTool(new Tool());

    driver = new BabelDriver({
      args: ['--qux'],
      env: { DEV: true },
    });
    driver.tool = tool;
    driver.bootstrap();

    routine = new RunCommandRoutine('babel', 'Run babel');
    routine.context = createDriverContext(driver);
    routine.tool = tool;
  });

  describe('expandGlobPatterns()', () => {
    it('passes through if no globs', async () => {
      const args = await routine.expandGlobPatterns(['--foo', 'bar', '-z']);

      expect(args).toEqual(['--foo', 'bar', '-z']);
    });

    it('converts globs to paths', async () => {
      const args = await routine.expandGlobPatterns(['--foo', './{scripts,tests}/*.js', 'bar']);

      expect(args).toEqual([
        '--foo',
        './scripts/build-packages.js',
        './scripts/bump-peer-deps.js',
        './tests/helpers.js',
        './tests/setup.js',
        'bar',
      ]);
    });
  });

  describe('extractNativeOptions()', () => {
    it('extracts all types of options', async () => {
      const options = await routine.extractNativeOptions();

      expect(options).toEqual(
        expect.objectContaining({
          '-f': true, // Short
          '-M': true, // Uppercase short
          '--filename': true, // Long
          '--no-highlight-code': true, // With dashes
        }),
      );
    });

    it('supports uppercased options', async () => {
      driver = new JestDriver();
      driver.tool = routine.tool;
      driver.bootstrap();

      routine.context.primaryDriver = driver;

      const options = await routine.extractNativeOptions();

      expect(options).toEqual(
        expect.objectContaining({
          '-c': true, // Short
          '--all': true, // Long
          '--changedFilesWithAncestor': true, // Camel case
        }),
      );
    });
  });

  describe('gatherArgs()', () => {
    it('merges driver and command line args', async () => {
      const args = await routine.gatherArgs();

      expect(args).toEqual(['--qux', '-a', '--foo', 'bar', 'baz']);
    });

    it('rebuilds context yargs', async () => {
      expect(routine.context.yargs).toEqual({
        _: ['baz'],
        a: true,
        foo: 'bar',
      });

      await routine.gatherArgs();

      expect(routine.context.yargs).toEqual({
        _: ['baz'],
        a: true,
        foo: 'bar',
        qux: true,
      });
    });
  });

  describe('includeConfigOption()', () => {
    it('does nothing if a config path doesnt match', async () => {
      const args = await routine.includeConfigOption(['--foo']);

      expect(args).toEqual(['--foo']);
    });

    it('appends config path for a match', async () => {
      routine.context.configPaths.push(prependRoot(driver.metadata.configName));

      const args = await routine.includeConfigOption(['--foo']);

      expect(args).toEqual(['--foo', '--config', prependRoot(driver.metadata.configName)]);
    });
  });

  describe('runCommandWithArgs()', () => {
    beforeEach(() => {
      routine.executeCommand = jest.fn(() => Promise.resolve({ success: true }));
      driver.handleSuccess = jest.fn();
      driver.handleFailure = jest.fn();
    });

    it('executes command with correct args', async () => {
      await routine.runCommandWithArgs(['--wtf']);

      expect(routine.executeCommand).toHaveBeenCalledWith('babel', ['--wtf'], {
        env: { DEV: true },
      });
    });

    it('handles success using driver', async () => {
      const response = await routine.runCommandWithArgs(['--wtf']);

      expect(response).toEqual({ success: true });
      expect(driver.handleSuccess).toHaveBeenCalledWith({ success: true });
    });

    it('handles failure using driver', async () => {
      routine.executeCommand.mockImplementation(() => Promise.reject(new Error('Oops')));

      try {
        await routine.runCommandWithArgs(['--wtf']);
      } catch (error) {
        expect(driver.handleFailure).toHaveBeenCalledWith(error);
      }
    });

    it('triggers `execute-driver` event', async () => {
      const spy = routine.tool.emit;

      await routine.runCommandWithArgs(['--wtf']);

      expect(spy).toHaveBeenCalledWith('execute-driver', [
        driver,
        ['--wtf'],
        routine.context.yargs,
      ]);
    });

    it('triggers `successful-driver` event on success', async () => {
      const spy = routine.tool.emit;

      await routine.runCommandWithArgs(['--wtf']);

      expect(spy).toHaveBeenCalledWith('successful-driver', [driver, { success: true }]);
    });

    it('triggers `failed-driver` event on failure', async () => {
      routine.executeCommand.mockImplementation(() => Promise.reject(new Error('Oops')));

      const spy = routine.tool.emit;

      try {
        await routine.runCommandWithArgs(['--wtf']);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('failed-driver', [driver, error]);
      }
    });
  });
});
