import fs from 'fs-extra';
import chalk from 'chalk';
import { Task } from '@boost/core';
import Driver from '../../src/Driver';
import RunCommandRoutine from '../../src/execute/RunCommandRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import JestDriver from '../../../driver-jest/src/JestDriver';
import { prependRoot, getRoot } from '../../../../tests/helpers';
import { mockTool, stubDriverContext, mockDebugger } from '../../src/testUtils';

jest.mock('fs-extra');

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
  let routine: RunCommandRoutine;
  let driver: Driver;
  let tool;

  beforeEach(() => {
    tool = mockTool();

    driver = new BabelDriver({
      args: ['--qux'],
      env: { DEV: 'true' },
    });
    driver.name = 'babel';
    driver.tool = tool;
    driver.bootstrap();

    routine = new RunCommandRoutine('babel', 'Run babel', {
      argv: ['-a', '--foo', 'bar', 'baz'],
    });
    routine.tool = tool;
    routine.context = stubDriverContext(driver);
    routine.debug = mockDebugger();
    routine.bootstrap();
  });

  describe('constructor()', () => {
    it('errors if `forceConfigOption` is not a boolean', () => {
      expect(() => {
        // @ts-ignore
        routine = new RunCommandRoutine('test', 'test', {
          forceConfigOption: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if `packageRoot` is not a string', () => {
      expect(() => {
        // @ts-ignore
        routine = new RunCommandRoutine('test', 'test', {
          packageRoot: 123,
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('captureLiveOutput()', () => {
    let stream: any;

    class MockStream {
      pipe() {
        return this;
      }

      on() {
        return this;
      }
    }

    beforeEach(() => {
      stream = {
        stdout: new MockStream(),
        stderr: new MockStream(),
      };
    });

    it('enables if args option matches watch option', () => {
      driver.metadata.watchOptions = ['--watch'];
      routine.context.args.watch = true;

      expect(routine.captureLiveOutput(stream)).toBe(true);
    });

    it('enables if args option matches short watch option', () => {
      driver.metadata.watchOptions = ['-w'];
      routine.context.args.w = true;

      expect(routine.captureLiveOutput(stream)).toBe(true);
    });

    it('enables if positional args includes watch option', () => {
      driver.metadata.watchOptions = ['watch'];
      routine.context.args._ = ['watch'];

      expect(routine.captureLiveOutput(stream)).toBe(true);
    });

    it('enables if args includes live option', () => {
      routine.context.args.live = true;

      expect(routine.captureLiveOutput(stream)).toBe(true);
    });

    it('disables if args option doesnt match watch option', () => {
      driver.metadata.watchOptions = ['--watch'];

      expect(routine.captureLiveOutput(stream)).toBe(false);
    });

    it('disables if positional args doesnt include watch option', () => {
      driver.metadata.watchOptions = ['--watch'];
      routine.context.args._ = ['--notWatch'];

      expect(routine.captureLiveOutput(stream)).toBe(false);
    });

    it('disables if args option is falsy', () => {
      driver.metadata.watchOptions = ['--watch'];
      routine.context.args.watch = false;

      expect(routine.captureLiveOutput(stream)).toBe(false);
    });

    it('pipes a batch stream when enabled', () => {
      const outSpy = jest.spyOn(stream.stdout, 'pipe');
      const errSpy = jest.spyOn(stream.stderr, 'pipe');

      driver.metadata.watchOptions = ['--watch'];
      routine.context.args.watch = true;

      routine.captureLiveOutput(stream);

      expect(outSpy).toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalled();
    });

    it('doesnt pipe a batch stream when using live', () => {
      const outSpy = jest.spyOn(stream.stdout, 'pipe');
      const errSpy = jest.spyOn(stream.stderr, 'pipe');

      routine.context.args.live = true;

      routine.captureLiveOutput(stream);

      expect(outSpy).not.toHaveBeenCalled();
      expect(errSpy).not.toHaveBeenCalled();
    });

    it('registers a data handler when using watch', () => {
      const outSpy = jest.spyOn(stream.stdout, 'on');
      const errSpy = jest.spyOn(stream.stderr, 'on');

      driver.metadata.watchOptions = ['--watch'];
      routine.context.args.watch = true;

      routine.captureLiveOutput(stream);

      expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
      expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
    });

    it('registers a data handler when using live', () => {
      const outSpy = jest.spyOn(stream.stdout, 'on');
      const errSpy = jest.spyOn(stream.stderr, 'on');

      routine.context.args.live = true;

      routine.captureLiveOutput(stream);

      expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
      expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      routine.executeCommand = jest.fn(() => Promise.resolve({ stdout: BABEL_HELP } as any));

      driver.metadata.filterOptions = true;
    });

    it('executes pipeline in order', async () => {
      routine.options.argv.push('--out-dir', './lib');

      const argSpy = jest.spyOn(routine, 'gatherArgs');
      const globSpy = jest.spyOn(routine, 'expandGlobPatterns');
      const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');
      const optSpy = jest.spyOn(routine, 'includeConfigOption');
      const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

      routine.bootstrap();

      const response = await routine.execute();

      expect(argSpy).toHaveBeenCalledWith(routine.context, expect.anything(), expect.anything());
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
      routine.context.configPaths.push({
        driver: 'babel',
        path: prependRoot(driver.metadata.configName),
      });

      const optSpy = jest.spyOn(routine, 'includeConfigOption');
      const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

      routine.bootstrap();

      await routine.execute();

      expect(optSpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
      expect(runSpy).toHaveBeenCalledWith(
        routine.context,
        ['baz', '--config-file', prependRoot(driver.metadata.configName)],
        expect.anything(),
      );
    });

    it('doesnt filter unknown if `filterOptions` is false', async () => {
      driver.metadata.filterOptions = false;

      const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');

      routine.bootstrap();

      await routine.execute();

      expect(filterSpy).not.toHaveBeenCalled();
    });

    it('calls `copyConfigToWorkspace` when driver is workspaces enabled', async () => {
      driver.metadata.workspaceStrategy = 'copy';
      routine.options.packageRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute();

      expect(copySpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
    });

    it('doesnt call `copyConfigToWorkspace` when driver is not workspaces enabled', async () => {
      routine.options.packageRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute();

      expect(copySpy).not.toHaveBeenCalled();
    });

    it('doesnt call `copyConfigToWorkspace` when no workspace root', async () => {
      driver.metadata.workspaceStrategy = 'copy';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute();

      expect(copySpy).not.toHaveBeenCalled();
    });
  });

  describe('copyConfigToWorkspacePackage()', () => {
    it('copies each config into workspace root', async () => {
      routine.options.packageRoot = '/some/root';
      routine.context.configPaths = [
        { driver: 'babel', path: '.babelrc' },
        { driver: 'jest', path: 'jest.json' },
      ];

      const args = await routine.copyConfigToWorkspacePackage(routine.context, ['foo', '--bar']);

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
        '../scripts/BumpPeerDeps.js',
        '../scripts/RunIntegrationTests.js',
        '../scripts/buildPackages.sh',
        '../scripts/extractOptionList.js',
        '../tests/index.js',
        'bar',
      ]);
    });

    it('handles missing paths', async () => {
      const args = await routine.expandGlobPatterns(routine.context, ['../some-fake-path/*.js']);

      expect(args).toEqual([]);
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

    it('supports multiple options within `helpOption`', async () => {
      driver.metadata.helpOption = '--help --all';

      const spy = jest.spyOn(routine, 'executeCommand');

      await routine.extractNativeOptions();

      expect(spy).toHaveBeenCalledWith('babel', ['--help', '--all'], { env: { DEV: 'true' } });
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
      routine.executeCommand = jest.fn(() => Promise.resolve({ stdout: BABEL_HELP } as any));
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
      expect(routine.debug).toHaveBeenCalledWith(
        'Filtered args: %s',
        chalk.gray('--foo, -X, --bar'),
      );
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
        chalk.gray('--foo, 123, --bar=456, -c, 789, -c=666'),
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
      routine.context.configPaths.push({
        driver: 'babel',
        path: prependRoot(driver.metadata.configName),
      });

      const args = await routine.includeConfigOption(routine.context, ['--foo']);

      expect(args).toEqual(['--foo', '--config-file', prependRoot(driver.metadata.configName)]);
    });
  });

  describe('runCommandWithArgs()', () => {
    const task = new Task<any>('Task', () => {});

    beforeEach(() => {
      routine.executeCommand = jest.fn(() => Promise.resolve({ success: true } as any));
      driver.handleSuccess = jest.fn();
      driver.handleFailure = jest.fn();
    });

    it('executes command with correct args', async () => {
      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(routine.executeCommand).toHaveBeenCalledWith('babel', ['--wtf'], {
        cwd: getRoot(),
        env: { DEV: 'true' },
        task,
        wrap: routine.captureLiveOutput,
      });
    });

    it('handles success using driver', async () => {
      const response = await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(response).toEqual({ success: true });
      expect(driver.handleSuccess).toHaveBeenCalledWith({ success: true });
    });

    it('handles failure using driver', async () => {
      (routine.executeCommand as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('Oops')),
      );

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(driver.handleFailure).toHaveBeenCalledWith(error);
      }
    });

    it('doesnt handle failure using driver if MaxBufferError occured', async () => {
      const error = new Error('Oops');
      error.name = 'MaxBufferError';

      (routine.executeCommand as jest.Mock).mockImplementation(() => Promise.reject(error));

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch {
        expect(driver.handleFailure).not.toHaveBeenCalled();
      }
    });

    it('triggers `before-execute` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(spy).toHaveBeenCalledWith('babel.before-execute', [
        routine.context,
        ['--wtf'],
        driver,
      ]);
    });

    it('triggers `after-execute` event on success', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(spy).toHaveBeenCalledWith('babel.after-execute', [
        routine.context,
        { success: true },
        driver,
      ]);
    });

    it('triggers `failed-execute` event on failure', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      (routine.executeCommand as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('Oops')),
      );

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('babel.failed-execute', [routine.context, error, driver]);
      }
    });
  });
});
