import { Tool } from 'boost';
import fs from 'fs-extra';
import RunCommandRoutine from '../../src/driver/RunCommandRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import JestDriver from '../../../driver-jest/src/JestDriver';
import {
  createDriverContext,
  setupMockTool,
  prependRoot,
  getRoot,
} from '../../../../tests/helpers';

jest.mock('fs-extra');

jest.mock('boost/lib/Tool');

const BABEL_HELP = `
Usage: babel [options] <files ...>


Options:

  -f, --filename [filename]            filename to use when reading from stdin - this will be used in source-maps, errors etc
  --retain-lines                       retain line numbers - will result in really ugly code
  --no-highlight-code                  enable/disable ANSI syntax highlighting of code frames (on by default) (default: true)
  --presets [list]
  --plugins [list]
  --ignore [list]                      list of glob paths to **not** compile
  --only [list]                        list of glob paths to **only** compile
  --no-comments                        write comments to generated output (true by default) (default: true)
  --compact [booleanString]            do not include superfluous whitespace characters and line terminators [true|false|auto]
  --minified                           save as much bytes when printing [true|false]
  -s, --source-maps [booleanString]    [true|false|inline]
  --source-map-target [string]         set \`file\` on returned source map
  --source-file-name [string]          set \`sources[0]\` on returned source map
  --source-root [filename]             the root from which all sources are relative
  --no-babelrc                         Whether or not to look up .babelrc and .babelignore files (default: true)
  --source-type [string]
  --auxiliary-comment-before [string]  print a comment before any injected non-user code
  --auxiliary-comment-after [string]   print a comment after any injected non-user code
  --module-root [filename]             optional prefix for the AMD module formatter that will be prepend to the filename on module definitions
  -M, --module-ids                     insert an explicit id for modules
  --module-id [string]                 specify a custom name for module ids
  --parser-opts [string]               Options to pass into the parser, or to change parsers (parserOpts.parser)
  --generator-opts [string]            Options to pass into the generator, or to change generators (generatorOpts.generator)
  -x, --extensions [extensions]        List of extensions to compile when a directory has been input [.es6,.js,.es,.jsx]
  -w, --watch                          Recompile files on changes
  --skip-initial-build                 Do not compile files before watching
  -o, --out-file [out]                 Compile all input files into a single file
  -d, --out-dir [out]                  Compile an input directory of modules into an output directory
  -D, --copy-files                     When compiling a directory copy over non-compilable files
  -q, --quiet                          Don't log anything
  -V, --version                        output the version number
  -h, --help                           output usage information
`;

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
    routine.debug = jest.fn();
    routine.debug.invariant = jest.fn();
  });

  describe('bootstrap()', () => {
    it('errors if `forceConfigOption` is not a boolean', () => {
      routine.options.forceConfigOption = 'foo';

      expect(() => {
        routine.bootstrap();
      }).toThrowError('Invalid RunCommandRoutine field "forceConfigOption". Must be a boolean.');
    });

    it('errors if `workspaceRoot` is not a string', () => {
      routine.options.workspaceRoot = 123;

      expect(() => {
        routine.bootstrap();
      }).toThrowError('Invalid RunCommandRoutine field "workspaceRoot". Must be a string.');
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      routine.executeCommand = jest.fn(() => Promise.resolve({ stdout: BABEL_HELP }));
      driver.metadata.filterOptions = true;
    });

    it('executes pipeline in order', async () => {
      routine.context.argv.push('--out-dir', './lib');

      const argSpy = jest.spyOn(routine, 'gatherArgs');
      const globSpy = jest.spyOn(routine, 'expandGlobPatterns');
      const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');
      const optSpy = jest.spyOn(routine, 'includeConfigOption');
      const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

      const response = await routine.execute(routine.context);

      expect(argSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(globSpy).toHaveBeenCalledWith(
        routine.context,
        ['--qux', '-a', '--foo', 'bar', 'baz', '--out-dir', './lib'],
        expect.anything(),
      );
      expect(filterSpy).toHaveBeenCalledWith(
        routine.context,
        ['--qux', '-a', '--foo', 'bar', 'baz', '--out-dir', './lib'],
        expect.anything(),
      );
      expect(optSpy).not.toHaveBeenCalled();
      expect(runSpy).toHaveBeenCalledWith(
        routine.context,
        ['baz', '--out-dir', './lib'],
        expect.anything(),
      );
      expect(response).toEqual({ stdout: BABEL_HELP });
    });

    it('includes config option if `useConfigOption` is true', async () => {
      driver.metadata.useConfigOption = true;
      routine.context.configPaths.push(prependRoot(driver.metadata.configName));

      const optSpy = jest.spyOn(routine, 'includeConfigOption');
      const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

      await routine.execute(routine.context);

      expect(optSpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
      expect(runSpy).toHaveBeenCalledWith(
        routine.context,
        ['baz', '--config', prependRoot(driver.metadata.configName)],
        expect.anything(),
      );
    });

    it('doesnt filter unknown if `filterOptions` is false', async () => {
      driver.metadata.filterOptions = false;

      const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');

      await routine.execute(routine.context);

      expect(filterSpy).not.toHaveBeenCalled();
    });

    it('calls `copyConfigToWorkspace` when driver is workspaces enabled', async () => {
      driver.metadata.workspaceStrategy = 'copy';
      routine.options.workspaceRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspace');

      await routine.execute(routine.context);

      expect(copySpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
    });

    it('doesnt call `copyConfigToWorkspace` when driver is not workspaces enabled', async () => {
      routine.options.workspaceRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspace');

      await routine.execute(routine.context);

      expect(copySpy).not.toHaveBeenCalled();
    });

    it('doesnt call `copyConfigToWorkspace` when no workspace root', async () => {
      driver.metadata.workspaceStrategy = 'copy';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspace');

      await routine.execute(routine.context);

      expect(copySpy).not.toHaveBeenCalled();
    });
  });

  describe('copyConfigToWorkspace()', () => {
    it('copies each config into workspace root', async () => {
      routine.options.workspaceRoot = '/some/root';
      routine.context.configPaths = ['.babelrc', 'jest.json'];

      const args = await routine.copyConfigToWorkspace(routine.context, ['foo', '--bar']);

      expect(args).toEqual(['foo', '--bar']);
      expect(fs.copyFileSync).toHaveBeenCalledWith('.babelrc', '/some/root/.babelrc');
      expect(fs.copyFileSync).toHaveBeenCalledWith('jest.json', '/some/root/jest.json');
    });
  });

  describe('expandGlobPatterns()', () => {
    it('passes through if no globs', async () => {
      const args = await routine.expandGlobPatterns(routine.context, ['--foo', 'bar', '-z']);

      expect(args).toEqual(['--foo', 'bar', '-z']);
    });

    it('converts globs to paths', async () => {
      const args = await routine.expandGlobPatterns(routine.context, [
        '--foo',
        '../{scripts,tests}/*.{sh,js}',
        'bar',
      ]);

      expect(args).toEqual([
        '--foo',
        '../scripts/build-packages.sh',
        '../scripts/bump-peer-deps.js',
        '../scripts/link-packages.sh',
        '../tests/helpers.js',
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
          '-u': true, // Short
          '--all': true, // Long
          '--changedFilesWithAncestor': true, // Camel case
        }),
      );
    });
  });

  describe('filterUnknownOptions()', () => {
    beforeEach(() => {
      routine.executeCommand = jest.fn(() => Promise.resolve({ stdout: BABEL_HELP }));
    });

    it('returns supported options', async () => {
      const args = await routine.filterUnknownOptions(routine.context, [
        './src',
        '-o',
        './lib',
        '--out-dir',
        './dist',
        '--minified',
      ]);

      expect(args).toEqual(['./src', '-o', './lib', '--out-dir', './dist', '--minified']);
    });

    it('filters unsupported options', async () => {
      const args = await routine.filterUnknownOptions(routine.context, [
        './src',
        '--foo',
        '-o',
        './lib',
        '--out-dir',
        './dist',
        '-X',
        '--minified',
        '--bar',
      ]);

      expect(args).toEqual(['./src', '-o', './lib', '--out-dir', './dist', '--minified']);
      expect(routine.debug).toHaveBeenCalledWith('Filtered args: %s', '--foo, -X, --bar');
    });

    it('skips unsupported option setters', async () => {
      const args = await routine.filterUnknownOptions(routine.context, [
        '--foo',
        '123',
        '--bar=456',
        '-w',
        '-c',
        '789',
        '-c=666',
      ]);

      expect(args).toEqual(['-w']);
      expect(routine.debug).toHaveBeenCalledWith(
        'Filtered args: %s',
        '--foo, 123, --bar=456, -c, 789, -c=666',
      );
    });
  });

  describe('gatherArgs()', () => {
    it('merges driver and command line args', async () => {
      const args = await routine.gatherArgs(routine.context);

      expect(args).toEqual(['--qux', '-a', '--foo', 'bar', 'baz']);
    });

    it('rebuilds context yargs', async () => {
      expect(routine.context.args).toEqual(
        expect.objectContaining({
          _: ['baz'],
          a: true,
          foo: 'bar',
        }),
      );

      await routine.gatherArgs(routine.context);

      expect(routine.context.args).toEqual(
        expect.objectContaining({
          _: ['baz'],
          a: true,
          foo: 'bar',
          qux: true,
        }),
      );
    });
  });

  describe('includeConfigOption()', () => {
    it('does nothing if a config path doesnt match', async () => {
      const args = await routine.includeConfigOption(routine.context, ['--foo']);

      expect(args).toEqual(['--foo']);
    });

    it('appends config path for a match', async () => {
      routine.context.configPaths.push(prependRoot(driver.metadata.configName));

      const args = await routine.includeConfigOption(routine.context, ['--foo']);

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
      const task = {};

      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(routine.executeCommand).toHaveBeenCalledWith('babel', ['--wtf'], {
        cwd: getRoot(),
        env: { DEV: true },
        task,
      });
    });

    it('handles success using driver', async () => {
      const response = await routine.runCommandWithArgs(routine.context, ['--wtf']);

      expect(response).toEqual({ success: true });
      expect(driver.handleSuccess).toHaveBeenCalledWith({ success: true });
    });

    it('handles failure using driver', async () => {
      routine.executeCommand.mockImplementation(() => Promise.reject(new Error('Oops')));

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf']);
      } catch (error) {
        expect(driver.handleFailure).toHaveBeenCalledWith(error);
      }
    });

    it('triggers `before-execute` event', async () => {
      await routine.runCommandWithArgs(routine.context, ['--wtf']);

      expect(routine.tool.emit).toHaveBeenCalledWith('before-execute', [
        driver,
        ['--wtf'],
        routine.context,
      ]);
    });

    it('triggers `after-execute` event on success', async () => {
      await routine.runCommandWithArgs(routine.context, ['--wtf']);

      expect(routine.tool.emit).toHaveBeenCalledWith('after-execute', [driver, { success: true }]);
    });

    it('triggers `failed-execute` event on failure', async () => {
      routine.executeCommand.mockImplementation(() => Promise.reject(new Error('Oops')));

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf']);
      } catch (error) {
        expect(routine.tool.emit).toHaveBeenCalledWith('failed-execute', [driver, error]);
      }
    });
  });
});
