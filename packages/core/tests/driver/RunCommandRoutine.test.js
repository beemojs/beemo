import { Tool } from 'boost';
import RunCommandRoutine from '../../src/driver/RunCommandRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import JestDriver from '../../../driver-jest/src/JestDriver';
import { createDriverContext, setupMockTool } from '../../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('RunCommandRoutine', () => {
  let routine;
  let driver;
  let tool;

  beforeEach(() => {
    tool = setupMockTool(new Tool());

    driver = new BabelDriver();
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
      const args = await routine.expandGlobPatterns(['--foo', './{scripts,tests}/*.js']);

      expect(args).toEqual([
        '--foo',
        './scripts/build-packages.js',
        './scripts/bump-peer-deps.js',
        './tests/helpers.js',
        './tests/setup.js',
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
});
