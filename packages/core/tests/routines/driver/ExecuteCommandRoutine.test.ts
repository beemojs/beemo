import fs from 'fs-extra';
import chalk from 'chalk';
import execa from 'execa';
import { Path } from '@boost/common';
import { Task, SignalError, ExitError } from '@boost/core';
import Driver from '../../../src/Driver';
import ExecuteCommandRoutine from '../../../src/routines/driver/ExecuteCommandRoutine';
import {
  mockTool,
  stubDriverContext,
  mockDebugger,
  prependRoot,
  getRoot,
  mockDriver,
} from '../../../src/testUtils';
import { StdioType } from '../../../src/types';
import DriverContext from '../../../lib/contexts/DriverContext';

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

describe('ExecuteCommandRoutine', () => {
  let routine: ExecuteCommandRoutine;
  let driver: Driver;
  let tool;

  beforeEach(() => {
    tool = mockTool();

    driver = mockDriver('babel', tool);
    driver.configure({
      args: ['--qux'],
      env: { DEV: 'true' },
    });
    driver.bootstrap();

    routine = new ExecuteCommandRoutine('babel', 'Run babel', {
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
        routine = new ExecuteCommandRoutine('test', 'test', {
          // @ts-ignore
          forceConfigOption: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if `packageRoot` is not a string', () => {
      expect(() => {
        routine = new ExecuteCommandRoutine('test', 'test', {
          // @ts-ignore
          packageRoot: 123,
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('captureOutput()', () => {
    const oldWrite = process.stdout.write;
    let writeSpy: jest.Mock;
    let stream: execa.ExecaChildProcess;

    class MockStream {
      handler?: (chunk: Buffer) => void;

      pipe() {
        return this;
      }

      on(key: string, handler: (chunk: Buffer) => void) {
        this.handler = handler;

        return this;
      }

      emit() {
        if (this.handler) {
          this.handler(Buffer.from('buffered', 'utf8'));
        }
      }
    }

    beforeEach(() => {
      stream = {
        // @ts-ignore
        stdout: new MockStream(),
        // @ts-ignore
        stderr: new MockStream(),
      };
      writeSpy = jest.fn();
      process.stdout.write = writeSpy;
    });

    afterEach(() => {
      process.stdout.write = oldWrite;
    });

    describe('watch', () => {
      it('enables if args option matches watch option', () => {
        driver.metadata.watchOptions = ['--watch'];
        routine.context.args.watch = true;

        expect(routine.captureOutput(stream)).toBe('watch');
      });

      it('enables if args option matches short watch option', () => {
        driver.metadata.watchOptions = ['-w'];
        routine.context.args.w = true;

        expect(routine.captureOutput(stream)).toBe('watch');
      });

      it('enables if positional args includes watch option', () => {
        driver.metadata.watchOptions = ['watch'];
        routine.context.args._ = ['watch'];

        expect(routine.captureOutput(stream)).toBe('watch');
      });

      it('disables if args option doesnt match watch option', () => {
        driver.metadata.watchOptions = ['--watch'];

        expect(routine.captureOutput(stream)).toBe('buffer');
      });

      it('disables if positional args doesnt include watch option', () => {
        driver.metadata.watchOptions = ['--watch'];
        routine.context.args._ = ['--notWatch'];

        expect(routine.captureOutput(stream)).toBe('buffer');
      });

      it('disables if args option is falsy', () => {
        driver.metadata.watchOptions = ['--watch'];
        routine.context.args.watch = false;

        expect(routine.captureOutput(stream)).toBe('buffer');
      });

      it('pipes a batch stream when enabled', () => {
        const outSpy = jest.spyOn(stream.stdout!, 'pipe');
        const errSpy = jest.spyOn(stream.stderr!, 'pipe');

        driver.metadata.watchOptions = ['--watch'];
        routine.context.args.watch = true;

        routine.captureOutput(stream);

        expect(outSpy).toHaveBeenCalled();
        expect(errSpy).toHaveBeenCalled();
      });

      it('registers a data handler when using watch', () => {
        const outSpy = jest.spyOn(stream.stdout!, 'on');
        const errSpy = jest.spyOn(stream.stderr!, 'on');

        driver.metadata.watchOptions = ['--watch'];
        routine.context.args.watch = true;

        routine.captureOutput(stream);

        expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
        expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
      });

      it('writes chunk to `process.stdout`', () => {
        driver.metadata.watchOptions = ['--watch'];
        routine.context.args.watch = true;

        routine.captureOutput(stream);

        stream.stdout!.emit('data');

        expect(writeSpy).toHaveBeenCalledWith('buffered');
      });
    });

    ['stream', 'inherit'].forEach((stdio) => {
      describe(`${stdio}`, () => {
        beforeEach(() => {
          routine.context.args.stdio = stdio as StdioType;
        });

        it('enables if `stdio` option is set', () => {
          expect(routine.captureOutput(stream)).toBe(stdio);
        });

        it('doesnt pipe a batch stream when using `stdio`', () => {
          const outSpy = jest.spyOn(stream.stdout!, 'pipe');
          const errSpy = jest.spyOn(stream.stderr!, 'pipe');

          routine.captureOutput(stream);

          expect(outSpy).not.toHaveBeenCalled();
          expect(errSpy).not.toHaveBeenCalled();
        });

        it('registers a data handler when using `stdio`', () => {
          const outSpy = jest.spyOn(stream.stdout!, 'on');
          const errSpy = jest.spyOn(stream.stderr!, 'on');

          routine.captureOutput(stream);

          expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
          expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
        });

        it('writes chunk to `process.stdout`', () => {
          routine.captureOutput(stream);

          stream.stdout!.emit('data');

          expect(writeSpy).toHaveBeenCalledWith('buffered');
        });
      });
    });

    describe('buffer', () => {
      beforeEach(() => {
        routine.context.args.stdio = 'buffer';
      });

      it('defaults to buffer if no `stdio` option or not watching', () => {
        expect(routine.captureOutput(stream)).toBe('buffer');
      });

      it('registers a data handler when buffering', () => {
        const outSpy = jest.spyOn(stream.stdout!, 'on');
        const errSpy = jest.spyOn(stream.stderr!, 'on');

        routine.captureOutput(stream);

        expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
        expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
      });

      it('writes buffered chunk to `process.stdout` when a signal error occurs', () => {
        routine.captureOutput(stream);

        stream.stdout!.emit('data');
        stream.stdout!.emit('data');
        stream.stdout!.emit('data');

        routine.tool.console.onError.emit([new SignalError('Error', 'SIGINT')]);

        expect(writeSpy).toHaveBeenCalledWith('\n\nbufferedbufferedbuffered');
      });

      it('doesnt write buffered chunk if a non-supported signal error occurs', () => {
        routine.captureOutput(stream);

        stream.stdout!.emit('data');
        stream.stdout!.emit('data');
        stream.stdout!.emit('data');

        routine.tool.console.onError.emit([new SignalError('Error', 'SIGABRT')]);

        expect(writeSpy).not.toHaveBeenCalled();
      });

      it('doesnt write buffered chunk if a non-signal error occurs', () => {
        routine.captureOutput(stream);

        stream.stdout!.emit('data');
        stream.stdout!.emit('data');
        stream.stdout!.emit('data');

        routine.tool.console.onError.emit([new Error('Error')]);

        expect(writeSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      jest
        .spyOn(routine, 'executeCommand')
        .mockImplementation(() => Promise.resolve({ stdout: BABEL_HELP } as $FixMe));

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

      const response = await routine.execute(routine.context, null);

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

      await routine.execute(routine.context, null);

      expect(optSpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
      expect(runSpy).toHaveBeenCalledWith(
        routine.context,
        ['baz', '--config', prependRoot(driver.metadata.configName).path()],
        expect.anything(),
      );
    });

    it('doesnt filter unknown if `filterOptions` is false', async () => {
      driver.metadata.filterOptions = false;

      const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');

      routine.bootstrap();

      await routine.execute(routine.context, null);

      expect(filterSpy).not.toHaveBeenCalled();
    });

    it('calls `copyConfigToWorkspace` when driver is workspaces enabled', async () => {
      driver.metadata.workspaceStrategy = 'copy';
      routine.options.packageRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute(routine.context, null);

      expect(copySpy).toHaveBeenCalledWith(routine.context, ['baz'], expect.anything());
    });

    it('doesnt call `copyConfigToWorkspace` when driver is not workspaces enabled', async () => {
      routine.options.packageRoot = '/some/root';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute(routine.context, null);

      expect(copySpy).not.toHaveBeenCalled();
    });

    it('doesnt call `copyConfigToWorkspace` when no workspace root', async () => {
      driver.metadata.workspaceStrategy = 'copy';

      const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

      routine.bootstrap();

      await routine.execute(routine.context, null);

      expect(copySpy).not.toHaveBeenCalled();
    });
  });

  describe('copyConfigToWorkspacePackage()', () => {
    it('copies each config into workspace root', async () => {
      const copySpy = jest.spyOn(fs, 'copyFileSync').mockImplementation(() => true);

      routine.options.packageRoot = '/some/root';
      routine.context.configPaths = [
        { driver: 'babel', path: new Path('.babelrc') },
        { driver: 'jest', path: new Path('jest.json') },
      ];

      const args = await routine.copyConfigToWorkspacePackage(routine.context, ['foo', '--bar']);

      expect(args).toEqual(['foo', '--bar']);
      expect(copySpy).toHaveBeenCalledWith('.babelrc', '/some/root/.babelrc');
      expect(copySpy).toHaveBeenCalledWith('jest.json', '/some/root/jest.json');

      copySpy.mockRestore();
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
        '../types/*',
        'bar',
      ]);

      // Make testing easier
      args.sort();

      expect(args).toEqual(['--foo', '../types/global.d.ts', '../types/milesj.d.ts', 'bar']);
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
      driver.getSupportedOptions = () => ['-u', '--all', '--changedFiles', '--watch-only'];

      routine.context.primaryDriver = driver;

      const options = await routine.extractNativeOptions();

      expect(options).toEqual(
        expect.objectContaining({
          '-u': true, // Short
          '--all': true, // Long
          '--changedFiles': true, // Camel case
          '--watch-only': true, // Dashed
        }),
      );
    });
  });

  describe('filterUnknownOptions()', () => {
    beforeEach(() => {
      jest
        .spyOn(routine, 'executeCommand')
        .mockImplementation(() => Promise.resolve({ stdout: BABEL_HELP } as $FixMe));
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

      expect(args).toEqual(['--foo', '--config', prependRoot(driver.metadata.configName).path()]);
    });
  });

  describe('runCommandWithArgs()', () => {
    const task = new Task<DriverContext>('Task', () => {});

    beforeEach(() => {
      jest
        .spyOn(routine, 'executeCommand')
        .mockImplementation(() => Promise.resolve({ success: true } as $FixMe));
      jest.spyOn(driver, 'processSuccess').mockImplementation();
      jest.spyOn(driver, 'processFailure').mockImplementation();
    });

    it('executes command with correct args', async () => {
      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(routine.executeCommand).toHaveBeenCalledWith('babel', ['--wtf'], {
        cwd: getRoot().path(),
        env: { DEV: 'true' },
        task,
        wrap: routine.captureOutput,
      });
    });

    it('handles success using driver', async () => {
      const response = await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(response).toEqual({ success: true });
      expect(driver.processSuccess).toHaveBeenCalledWith({ success: true });
    });

    it('handles failure using driver', async () => {
      (routine.executeCommand as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('Oops')),
      );

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(driver.processFailure).toHaveBeenCalledWith(error);
      }
    });

    it('persists exit code when a failure', async () => {
      (routine.executeCommand as jest.Mock).mockImplementation(() => {
        const error = new Error('Oops');
        // @ts-ignore
        error.exitCode = 3;

        return Promise.reject(error);
      });

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(error).toBeInstanceOf(ExitError);
        expect(error.code).toBe(3);
      }
    });

    it('handles out of memory failures', async () => {
      (routine.executeCommand as jest.Mock).mockImplementation(() =>
        // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject({ exitCode: null, message: '', signal: 'SIGKILL' }),
      );

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(error).toEqual(new ExitError('Out of memory!', 1));
      }
    });

    it('doesnt handle failure using driver if MaxBufferError occured', async () => {
      const error = new Error('Oops');
      error.name = 'MaxBufferError';

      (routine.executeCommand as jest.Mock).mockImplementation(() => Promise.reject(error));

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch {
        expect(driver.processFailure).not.toHaveBeenCalled();
      }
    });

    it('emits `onBeforeExecute` event', async () => {
      const spy = jest.fn();

      driver.onBeforeExecute.listen(spy);

      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(spy).toHaveBeenCalledWith(routine.context, ['--wtf']);
    });

    it('emits `onAfterExecute` event on success', async () => {
      const spy = jest.fn();

      driver.onAfterExecute.listen(spy);

      await routine.runCommandWithArgs(routine.context, ['--wtf'], task);

      expect(spy).toHaveBeenCalledWith(routine.context, { success: true });
    });

    it('emits `onFailedExecute` event on failure', async () => {
      const spy = jest.fn();

      driver.onFailedExecute.listen(spy);

      (routine.executeCommand as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error('Oops')),
      );

      try {
        await routine.runCommandWithArgs(routine.context, ['--wtf'], task);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith(routine.context, error);
      }
    });
  });
});
