import execa from 'execa';
import fs from 'fs-extra';
import { ExitError, Path } from '@boost/common';
import { color } from '@boost/internal';
import { DriverContext } from '../../../src/contexts/DriverContext';
import { Driver } from '../../../src/Driver';
import { ExecuteCommandRoutine } from '../../../src/routines/driver/ExecuteCommandRoutine';
import {
	getRoot,
	mockDebugger,
	mockDriver,
	mockTool,
	prependRoot,
	stubDriverContext,
} from '../../../src/test';
import { Tool } from '../../../src/Tool';

describe('ExecuteCommandRoutine', () => {
	let routine: ExecuteCommandRoutine;
	let context: DriverContext;
	let driver: Driver;
	let tool: Tool;

	beforeEach(() => {
		tool = mockTool();

		driver = mockDriver('babel', tool);
		driver.configure({
			args: ['--qux'],
			env: { DEV: 'true' },
		});

		context = stubDriverContext(driver);

		routine = new ExecuteCommandRoutine('babel', 'Run babel', {
			argv: ['-a', '--foo', 'bar', 'baz'],
			tool,
		});
		// @ts-expect-error Overwrite readonly
		routine.debug = mockDebugger();
	});

	describe('constructor()', () => {
		it('errors if `forceConfigOption` is not a boolean', () => {
			expect(() => {
				routine = new ExecuteCommandRoutine('test', 'test', {
					// @ts-expect-error Invalid type
					forceConfigOption: 'foo',
				});
			}).toThrowErrorMatchingSnapshot();
		});

		it('errors if `packageRoot` is not a string', () => {
			expect(() => {
				routine = new ExecuteCommandRoutine('test', 'test', {
					// @ts-expect-error Invalid type
					packageRoot: 123,
				});
			}).toThrowErrorMatchingSnapshot();
		});
	});

	describe('captureOutput()', () => {
		let logSpy: jest.SpyInstance;
		let errorSpy: jest.SpyInstance;
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
			tool.outStream = { write() {} };
			tool.errStream = { write() {} };

			stream = {
				// @ts-expect-error Invalid type
				stdout: new MockStream(),
				// @ts-expect-error Invalid type
				stderr: new MockStream(),
			};

			logSpy = jest.spyOn(tool.outStream, 'write');
			errorSpy = jest.spyOn(tool.errStream, 'write');
		});

		afterEach(() => {
			logSpy.mockRestore();
			errorSpy.mockRestore();
		});

		describe('watch', () => {
			it('enables if args option matches watch option', () => {
				driver.metadata.watchOptions = ['--watch'];
				context.args.unknown.watch = 'true';

				expect(routine.captureOutput(context, stream)).toBe('watch');
			});

			it('enables if args option matches short watch option', () => {
				driver.metadata.watchOptions = ['-w'];
				context.args.unknown.w = 'true';

				expect(routine.captureOutput(context, stream)).toBe('watch');
			});

			it('enables if positional args includes watch option', () => {
				driver.metadata.watchOptions = ['watch'];
				context.args.params = ['watch'];

				expect(routine.captureOutput(context, stream)).toBe('watch');
			});

			it('disables if args option doesnt match watch option', () => {
				driver.metadata.watchOptions = ['--watch'];

				expect(routine.captureOutput(context, stream)).toBe('buffer');
			});

			it('disables if positional args doesnt include watch option', () => {
				driver.metadata.watchOptions = ['--watch'];
				context.args.params = ['--notWatch'];

				expect(routine.captureOutput(context, stream)).toBe('buffer');
			});

			it('disables if args option is falsy', () => {
				driver.metadata.watchOptions = ['--watch'];

				expect(routine.captureOutput(context, stream)).toBe('buffer');
			});

			it('pipes a batch stream when enabled', () => {
				const outSpy = jest.spyOn(stream.stdout!, 'pipe');
				const errSpy = jest.spyOn(stream.stderr!, 'pipe');

				driver.metadata.watchOptions = ['--watch'];
				context.args.unknown.watch = 'true';

				routine.captureOutput(context, stream);

				expect(outSpy).toHaveBeenCalled();
				expect(errSpy).toHaveBeenCalled();
			});

			it('registers a data handler when using watch', () => {
				const outSpy = jest.spyOn(stream.stdout!, 'on');
				const errSpy = jest.spyOn(stream.stderr!, 'on');

				driver.metadata.watchOptions = ['--watch'];
				context.args.unknown.watch = 'true';

				routine.captureOutput(context, stream);

				expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
				expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
			});

			it('writes chunk to stdout stream', () => {
				driver.metadata.watchOptions = ['--watch'];
				context.args.unknown.watch = 'true';

				routine.captureOutput(context, stream);

				stream.stdout!.emit('data');

				expect(logSpy).toHaveBeenCalledWith('buffered');
			});
		});

		['stream', 'pipe'].forEach((strategy) => {
			describe(`${strategy}`, () => {
				beforeEach(() => {
					driver.configure({
						outputStrategy: strategy as 'stream',
					});
				});

				it('enables if option is set', () => {
					expect(routine.captureOutput(context, stream)).toBe(strategy);
				});

				it('doesnt pipe a batch stream', () => {
					const outSpy = jest.spyOn(stream.stdout!, 'pipe');
					const errSpy = jest.spyOn(stream.stderr!, 'pipe');

					routine.captureOutput(context, stream);

					expect(outSpy).not.toHaveBeenCalled();
					expect(errSpy).not.toHaveBeenCalled();
				});

				it('registers a data handler', () => {
					const outSpy = jest.spyOn(stream.stdout!, 'on');
					const errSpy = jest.spyOn(stream.stderr!, 'on');

					routine.captureOutput(context, stream);

					expect(outSpy).toHaveBeenCalledWith('data', expect.anything());
					expect(errSpy).toHaveBeenCalledWith('data', expect.anything());
				});

				it('writes chunk to stdout stream', () => {
					routine.captureOutput(context, stream);

					stream.stdout!.emit('data');

					expect(logSpy).toHaveBeenCalledWith('buffered');
				});
			});
		});

		describe('buffer', () => {
			beforeEach(() => {
				driver.configure({
					outputStrategy: 'buffer',
				});
			});

			it('defaults to buffer if no option or not watching', () => {
				expect(routine.captureOutput(context, stream)).toBe('buffer');
			});
		});
	});

	describe('execute()', () => {
		beforeEach(() => {
			driver.metadata.filterOptions = true;
		});

		it('executes pipeline in order', async () => {
			routine.options.argv.push('--out-dir', './lib');

			const argSpy = jest.spyOn(routine, 'gatherArgs');
			const globSpy = jest.spyOn(routine, 'expandGlobPatterns');
			const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');
			const optSpy = jest.spyOn(routine, 'includeConfigOption');
			const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

			const response = await routine.execute(context);

			expect(argSpy).toHaveBeenCalledWith(context, undefined, expect.anything());
			expect(globSpy).toHaveBeenCalledWith(
				context,
				['--qux', '-a', '--foo', 'bar', 'baz', '--out-dir', './lib'],
				expect.anything(),
			);
			expect(filterSpy).toHaveBeenCalledWith(
				context,
				['--qux', '-a', '--foo', 'bar', 'baz', '--out-dir', './lib'],
				expect.anything(),
			);
			expect(optSpy).not.toHaveBeenCalled();
			expect(runSpy).toHaveBeenCalledWith(
				context,
				['baz', '--out-dir', './lib'],
				expect.anything(),
			);
			expect(response).toEqual({ stdout: '' });
		});

		it('includes config option if `useConfigOption` is true', async () => {
			driver.metadata.useConfigOption = true;

			context.configPaths.push({
				driver: 'babel',
				path: prependRoot(driver.metadata.configName),
			});

			const optSpy = jest.spyOn(routine, 'includeConfigOption');
			const runSpy = jest.spyOn(routine, 'runCommandWithArgs');

			await routine.execute(context);

			expect(optSpy).toHaveBeenCalledWith(context, ['baz'], expect.anything());
			expect(runSpy).toHaveBeenCalledWith(
				context,
				['baz', '--config', prependRoot(driver.metadata.configName).path()],
				expect.anything(),
			);
		});

		it('doesnt filter unknown if `filterOptions` is false', async () => {
			driver.metadata.filterOptions = false;

			const filterSpy = jest.spyOn(routine, 'filterUnknownOptions');

			await routine.execute(context);

			expect(filterSpy).not.toHaveBeenCalled();
		});

		it('calls `copyConfigToWorkspace` when driver is workspaces enabled', async () => {
			driver.metadata.workspaceStrategy = 'copy';
			routine.configure({
				packageRoot: '/some/root',
			});

			const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

			await routine.execute(context);

			expect(copySpy).toHaveBeenCalledWith(context, ['baz'], expect.anything());
		});

		it('doesnt call `copyConfigToWorkspace` when driver is not workspaces enabled', async () => {
			routine.configure({
				packageRoot: '/some/root',
			});

			const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

			await routine.execute(context);

			expect(copySpy).not.toHaveBeenCalled();
		});

		it('doesnt call `copyConfigToWorkspace` when no workspace root', async () => {
			driver.metadata.workspaceStrategy = 'copy';

			const copySpy = jest.spyOn(routine, 'copyConfigToWorkspacePackage');

			await routine.execute(context);

			expect(copySpy).not.toHaveBeenCalled();
		});

		it('doesnt call `expandGlobPatterns` when expandGlobs is `false`', async () => {
			driver.configure({ expandGlobs: false });

			const expandGlobsSpy = jest.spyOn(routine, 'expandGlobPatterns');

			await routine.execute(context);

			expect(expandGlobsSpy).not.toHaveBeenCalled();
		});
	});

	describe('copyConfigToWorkspacePackage()', () => {
		it('copies each config into workspace root', async () => {
			const copySpy = jest.spyOn(fs, 'copyFileSync').mockImplementation(() => true);

			routine.configure({
				packageRoot: '/some/root',
			});

			context.configPaths = [
				{ driver: 'babel', path: new Path('.babelrc') },
				{ driver: 'jest', path: new Path('jest.json') },
			];

			const args = await routine.copyConfigToWorkspacePackage(context, ['foo', '--bar']);

			expect(args).toEqual(['foo', '--bar']);
			expect(copySpy).toHaveBeenCalledWith('.babelrc', '/some/root/.babelrc');
			expect(copySpy).toHaveBeenCalledWith('jest.json', '/some/root/jest.json');

			copySpy.mockRestore();
		});
	});

	describe('expandGlobPatterns()', () => {
		it('passes through if no globs', async () => {
			const args = await routine.expandGlobPatterns(context, ['--foo', 'bar', '-z']);

			expect(args).toEqual(['--foo', 'bar', '-z']);
		});

		it('converts globs to paths', async () => {
			const args = await routine.expandGlobPatterns(context, ['--foo', '../tests/*', 'bar']);

			// Make testing easier
			args.sort();

			expect(args).toEqual([
				'--foo',
				'../tests/__fixtures__',
				'../tests/configs',
				'../tests/setup.ts',
				'bar',
			]);
		});

		it('handles missing paths', async () => {
			const args = await routine.expandGlobPatterns(context, ['../some-fake-path/*.js']);

			expect(args).toEqual([]);
		});
	});

	describe('extractNativeOptions()', () => {
		it('extracts all types of options', async () => {
			const options = await routine.extractNativeOptions(context);

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

			await routine.extractNativeOptions(context);

			expect(spy).toHaveBeenCalledWith('babel', ['--help', '--all'], {
				env: { DEV: 'true' },
				preferLocal: true,
			});
		});

		it('supports uppercased options', async () => {
			driver.getSupportedOptions = () => ['-u', '--all', '--changedFiles', '--watch-only'];

			context.primaryDriver = driver;

			const options = await routine.extractNativeOptions(context);

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
		it('returns supported options', async () => {
			const args = await routine.filterUnknownOptions(context, [
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
			const args = await routine.filterUnknownOptions(context, [
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
				color.mute('--foo, -X, --bar'),
			);
		});

		it('skips unsupported option setters', async () => {
			const args = await routine.filterUnknownOptions(context, [
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
				color.mute('--foo, 123, --bar=456, -c, 789, -c=666'),
			);
		});
	});

	describe('gatherArgs()', () => {
		it('merges driver and command line args', async () => {
			const args = await routine.gatherArgs(context);

			expect(args).toEqual(['--qux', '-a', '--foo', 'bar', 'baz']);
		});

		it('rebuilds context args object', async () => {
			expect(context.args).toEqual(
				expect.objectContaining({
					params: ['baz'],
					options: {
						a: true,
						foo: 'bar',
					},
				}),
			);

			await routine.gatherArgs(context);

			expect(context.args).toEqual(
				expect.objectContaining({
					params: ['baz'],
					options: {
						a: true,
						foo: 'bar',
						qux: true,
					},
				}),
			);
		});
	});

	describe('includeConfigOption()', () => {
		it('does nothing if a config path doesnt match', async () => {
			const args = await routine.includeConfigOption(context, ['--foo']);

			expect(args).toEqual(['--foo']);
		});

		it('appends config path for a match', async () => {
			context.configPaths.push({
				driver: 'babel',
				path: prependRoot(driver.metadata.configName),
			});

			const args = await routine.includeConfigOption(context, ['--foo']);

			expect(args).toEqual(['--foo', '--config', prependRoot(driver.metadata.configName).path()]);
		});
	});

	describe('runCommandWithArgs()', () => {
		const task = expect.anything(); // new Task<DriverContext>('Task', () => {});

		beforeEach(() => {
			jest
				.spyOn(routine, 'executeCommand')
				.mockImplementation(() => Promise.resolve({ success: true } as any));
			jest.spyOn(driver, 'processSuccess').mockImplementation();
			jest.spyOn(driver, 'processFailure').mockImplementation();
		});

		it('executes command with correct args', async () => {
			await routine.runCommandWithArgs(context, ['--wtf'], task);

			expect(routine.executeCommand).toHaveBeenCalledWith('babel', ['--wtf'], {
				cwd: getRoot().path(),
				env: { DEV: 'true' },
				preferLocal: true,
				workUnit: task,
				wrap: expect.any(Function),
			});
		});

		it('handles success using driver', async () => {
			const response = await routine.runCommandWithArgs(context, ['--wtf'], task);

			expect(response).toEqual({ success: true });
			expect(driver.processSuccess).toHaveBeenCalledWith({ success: true });
		});

		it('handles failure using driver', async () => {
			(routine.executeCommand as jest.Mock).mockImplementation(() =>
				Promise.reject(new Error('Oops')),
			);

			try {
				await routine.runCommandWithArgs(context, ['--wtf'], task);
			} catch (error) {
				expect(driver.processFailure).toHaveBeenCalledWith(error);
			}
		});

		it('persists exit code when a failure', async () => {
			(routine.executeCommand as jest.Mock).mockImplementation(() => {
				const error = new Error('Oops');
				// @ts-expect-error Field doesnt exist on errors
				error.exitCode = 3;

				return Promise.reject(error);
			});

			try {
				await routine.runCommandWithArgs(context, ['--wtf'], task);
			} catch (error) {
				expect(error).toBeInstanceOf(ExitError);
				expect((error as ExitError).code).toBe(3);
			}
		});

		it('handles out of memory failures', async () => {
			(routine.executeCommand as jest.Mock).mockImplementation(() =>
				// eslint-disable-next-line prefer-promise-reject-errors
				Promise.reject({ exitCode: null, message: '', signal: 'SIGKILL' }),
			);

			try {
				await routine.runCommandWithArgs(context, ['--wtf'], task);
			} catch (error) {
				expect(error).toEqual(new ExitError('Out of memory!', 1));
			}
		});

		it('doesnt handle failure using driver if MaxBufferError occured', async () => {
			const error = new Error('Oops');
			error.name = 'MaxBufferError';

			(routine.executeCommand as jest.Mock).mockImplementation(() => Promise.reject(error));

			try {
				await routine.runCommandWithArgs(context, ['--wtf'], task);
			} catch {
				expect(driver.processFailure).not.toHaveBeenCalled();
			}
		});

		it('emits `onBeforeExecute` event', async () => {
			const spy = jest.fn();

			driver.onBeforeExecute.listen(spy);

			await routine.runCommandWithArgs(context, ['--wtf'], task);

			expect(spy).toHaveBeenCalledWith(context, ['--wtf']);
		});

		it('emits `onAfterExecute` event on success', async () => {
			const spy = jest.fn();

			driver.onAfterExecute.listen(spy);

			await routine.runCommandWithArgs(context, ['--wtf'], task);

			expect(spy).toHaveBeenCalledWith(context, { success: true });
		});

		it('emits `onFailedExecute` event on failure', async () => {
			const spy = jest.fn();

			driver.onFailedExecute.listen(spy);

			(routine.executeCommand as jest.Mock).mockImplementation(() =>
				Promise.reject(new Error('Oops')),
			);

			try {
				await routine.runCommandWithArgs(context, ['--wtf'], task);
			} catch (error) {
				expect(spy).toHaveBeenCalledWith(context, error);
			}
		});
	});
});
