import fs from 'fs-extra';
import { Path } from '@boost/common';
import { mockNormalizedFilePath, normalizeSeparators } from '@boost/common/test';
import { getFixturePath } from '@boost/test-utils';
import { Context } from '../src/contexts/Context';
import { CleanupConfigsRoutine } from '../src/routines/CleanupConfigsRoutine';
import { ResolveConfigsRoutine } from '../src/routines/ResolveConfigsRoutine';
import { RunDriverRoutine } from '../src/routines/RunDriverRoutine';
import { RunScriptRoutine } from '../src/routines/RunScriptRoutine';
import { ScaffoldRoutine } from '../src/routines/ScaffoldRoutine';
import {
	mockConsole,
	mockDriver,
	mockToolConfig,
	stubConfigArgs,
	stubConfigContext,
	stubDriverArgs,
	stubScaffoldArgs,
	stubScriptArgs,
} from '../src/test';
import { Tool } from '../src/Tool';

jest.mock('execa');

describe('Tool', () => {
	let tool: Tool;
	let driverSpy: jest.SpyInstance;
	let scriptSpy: jest.SpyInstance;
	const fooDriver = mockDriver('foo');
	const barDriver = mockDriver('bar');
	const bazDriver = mockDriver('baz');

	function spyTool(inst: Tool) {
		driverSpy = jest.spyOn(inst.driverRegistry, 'loadMany').mockImplementation();
		scriptSpy = jest.spyOn(inst.scriptRegistry, 'loadMany').mockImplementation();

		return inst;
	}

	beforeEach(() => {
		tool = new Tool({ argv: ['foo', 'bar'] });
		tool.config = mockToolConfig();

		spyTool(tool);
	});

	it('sets argv', () => {
		expect(tool.argv).toEqual(['foo', 'bar']);
	});

	describe('bootstrap()', () => {
		it('loads package.json', async () => {
			expect(tool.package).toBeUndefined();

			await tool.bootstrap();

			expect(tool.package).toBeDefined();
		});

		it('loads drivers and scripts', async () => {
			await tool.bootstrap();

			expect(driverSpy).toHaveBeenCalledWith(
				{
					babel: true,
					eslint: true,
					jest: true,
					lerna: true,
					mocha: true,
					prettier: true,
					rollup: true,
					stylelint: true,
					typescript: { buildFolder: 'dts', declarationOnly: true },
					webpack: true,
				},
				{ tool },
			);
			expect(scriptSpy).toHaveBeenCalledWith({}, { tool });
		});

		it('errors if no root folder', async () => {
			tool = new Tool({
				argv: [],
				cwd: getFixturePath('consumer-no-root'),
			});

			await expect(tool.bootstrap()).rejects.toThrow(
				'Invalid configuration root. Requires a `.config` folder and `package.json`. [CFG:ROOT_INVALID]',
			);
		});

		describe('no config', () => {
			it('returns default config structure', async () => {
				tool = new Tool({
					argv: [],
					cwd: getFixturePath('consumer-no-config'),
				});

				await tool.bootstrap();

				expect(tool.config).toEqual({
					configure: {
						cleanup: false,
						parallel: true,
					},
					debug: false,
					drivers: {},
					execute: {
						concurrency: 3,
						graph: true,
						output: '',
					},
					module: '',
					scripts: {},
					settings: {},
				});
			});
		});

		describe('root config', () => {
			it('merges with default config structure', async () => {
				tool = new Tool({
					argv: [],
					cwd: getFixturePath('consumer'),
				});

				await spyTool(tool).bootstrap();

				expect(tool.config).toEqual({
					configure: {
						cleanup: false,
						parallel: false,
					},
					debug: false,
					drivers: {
						babel: false,
						jest: {
							env: { NODE_ENV: 'test' },
						},
					},
					execute: {
						concurrency: 3,
						graph: true,
						output: '',
					},
					module: '@beemo/dev',
					scripts: {
						build: true,
						init: true,
					},
					settings: {
						customValue: true,
					},
				});
			});

			it('can support a custom config name', async () => {
				tool = new Tool({
					argv: [],
					cwd: getFixturePath('consumer-branded'),
					projectName: 'bmo',
				});

				await spyTool(tool).bootstrap();

				expect(tool.config.settings).toEqual({
					customName: true,
				});
			});
		});
	});

	describe('bootstrapConfigModule()', () => {
		it('loads the main entry point and executes if a function', async () => {
			tool.config.module = getFixturePath('consumer-bootstrap');

			const spy = mockConsole('log');

			await tool.bootstrapConfigModule();

			expect(spy).toHaveBeenCalledWith('Bootstrapped', tool);

			spy.mockRestore();
		});

		it('does nothing if entry point doesnt return a function', async () => {
			tool.config.module = getFixturePath('consumer-bootstrap-nonfunc');

			const spy = mockConsole('log');

			await tool.bootstrapConfigModule();

			expect(spy).not.toHaveBeenCalled();

			spy.mockRestore();
		});

		it('does nothing for invalid module name', async () => {
			tool.config.module = 'unknown-module';

			const spy = mockConsole('log');

			await tool.bootstrapConfigModule();

			expect(spy).not.toHaveBeenCalled();

			spy.mockRestore();
		});
	});

	describe('getConfigModuleRoot()', () => {
		it('errors if no module name', () => {
			tool.config.module = '';

			expect(() => {
				tool.getConfigModuleRoot();
			}).toThrow(
				'Beemo requires a `module` property within your configuration. This property is the name of a module that houses your configuration files.',
			);
		});

		it('errors if a fake and or missing node module', () => {
			tool.config.module = 'beemo-this-should-never-exist';

			expect(() => {
				tool.getConfigModuleRoot();
			}).toThrow('Module "beemo-this-should-never-exist" defined in `module` could not be found.');
		});

		it('returns cwd if using @local', () => {
			tool = new Tool({
				argv: [],
				cwd: getFixturePath('consumer'),
			});
			tool.config = mockToolConfig();
			tool.config.module = '@local';

			expect(normalizeSeparators(tool.getConfigModuleRoot())).toEqual(
				normalizeSeparators(tool.cwd),
			);
			expect(tool.getConfigModuleRoot()).toBe(tool.getConfigModuleRoot());
		});

		it('returns node module path', () => {
			tool.config.module = '@boost/common';

			expect(tool.getConfigModuleRoot().path()).toEqual(
				expect.stringContaining(normalizeSeparators('node_modules/@boost/common')),
			);
			expect(tool.getConfigModuleRoot()).toBe(tool.getConfigModuleRoot());
		});
	});

	describe('cleanupOnFailure()', () => {
		let context: Context;
		let removeSpy: jest.SpyInstance;

		beforeEach(() => {
			context = stubConfigContext();
			removeSpy = jest.spyOn(fs, 'removeSync').mockImplementation(() => true);
		});

		it('does nothing if no error', () => {
			tool.cleanupOnFailure();

			expect(removeSpy).not.toHaveBeenCalled();
		});

		it('does nothing if no context', () => {
			tool.cleanupOnFailure(new Error('Fail'));

			expect(removeSpy).not.toHaveBeenCalled();
		});

		it('does nothing if no config paths', () => {
			tool.context = context;
			tool.cleanupOnFailure(new Error('Fail'));

			expect(removeSpy).not.toHaveBeenCalled();
		});

		it('removes file for each config path', () => {
			context.configPaths = [
				{ driver: 'foo', path: new Path('foo') },
				{ driver: 'bar', path: new Path('bar') },
			];
			tool.context = context;
			tool.cleanupOnFailure(new Error('Fail'));

			expect(removeSpy).toHaveBeenCalledWith('foo');
			expect(removeSpy).toHaveBeenCalledWith('bar');
		});
	});

	describe('createConfigurePipeline()', () => {
		beforeEach(async () => {
			await tool.driverRegistry.register('foo', fooDriver);
			await tool.driverRegistry.register('bar', barDriver);
			await tool.driverRegistry.register('baz', bazDriver);
		});

		it('creates a pipeline with the `ResolveConfigsRoutine`', () => {
			const pipeline = tool.createConfigurePipeline(stubConfigArgs());
			const work = pipeline.getWorkUnits();

			expect(work).toEqual([expect.any(ResolveConfigsRoutine)]);
			expect(work[0].title).toBe('Creating config files');
		});

		describe('all drivers', () => {
			it('sets args to context', () => {
				const pipeline = tool.createConfigurePipeline(stubConfigArgs());

				expect([...pipeline.context.drivers]).toEqual([fooDriver, barDriver, bazDriver]);
			});

			it('emits `onRunCreateConfig` event with all names', () => {
				const spy = jest.fn();

				tool.onRunCreateConfig.listen(spy);
				tool.createConfigurePipeline(stubConfigArgs());

				expect(spy).toHaveBeenCalledWith(tool.context, ['foo', 'bar', 'baz']);
			});
		});

		describe('explicit drivers', () => {
			it('sets args to context', () => {
				const pipeline = tool.createConfigurePipeline(stubConfigArgs(), ['foo']);

				expect([...pipeline.context.drivers]).toEqual([fooDriver]);
			});

			it('emits `onRunCreateConfig` event with each name', () => {
				const spy = jest.fn();

				tool.onRunCreateConfig.listen(spy);
				tool.createConfigurePipeline(stubConfigArgs(), ['bar']);

				expect(spy).toHaveBeenCalledWith(tool.context, ['bar']);
			});
		});
	});

	describe('createRunDriverPipeline()', () => {
		describe('registered driver', () => {
			beforeEach(async () => {
				await tool.driverRegistry.register('foo', fooDriver);
			});

			it('sets args to context', () => {
				const pipeline = tool.createRunDriverPipeline(stubDriverArgs(), 'foo', [
					['a', '-b', '--c'],
				]);

				expect(pipeline.context.primaryDriver).toBe(fooDriver);
				expect(pipeline.context.driverName).toBe('foo');
				expect(pipeline.context.parallelArgv).toEqual([['a', '-b', '--c']]);
			});

			it('creates a pipeline with the `ResolveConfigsRoutine`, `RunDriverRoutine`, `CleanupConfigsRoutine`', () => {
				const pipeline = tool.createRunDriverPipeline(stubDriverArgs(), 'foo');
				const work = pipeline.getWorkUnits();

				expect(work).toEqual([
					expect.any(ResolveConfigsRoutine),
					expect.any(RunDriverRoutine),
					expect.any(CleanupConfigsRoutine),
				]);
				expect(work[0].title).toBe('Creating config files');
				expect(work[1].title).toBe('Running foo v0.0.0 driver');
				expect(work[2].title).toBe('Cleaning up');
			});

			it('emits `onRunDriver` event', () => {
				const spy = jest.fn();

				tool.onRunDriver.listen(spy, 'foo');
				tool.createRunDriverPipeline(stubDriverArgs(), 'foo');

				expect(spy).toHaveBeenCalledWith(tool.context, fooDriver);
			});

			it('skips cleanup based on `configure.cleanup` option', () => {
				tool.config.configure.cleanup = false;

				expect(
					tool.createRunDriverPipeline(stubDriverArgs(), 'foo').getWorkUnits()[2].isSkipped(),
				).toBe(true);

				tool.config.configure.cleanup = true;

				expect(
					tool.createRunDriverPipeline(stubDriverArgs(), 'foo').getWorkUnits()[2].isSkipped(),
				).toBe(false);
			});
		});

		describe('unregistered driver', () => {
			it('errors if driver does not exist', () => {
				expect(() => {
					tool.createRunDriverPipeline(stubDriverArgs(), 'foo');
				}).toThrow('Failed to find driver "foo". Have you installed it? [PLG:PLUGIN_REQUIRED]');
			});
		});
	});

	describe('createRunScriptPipeline()', () => {
		it('errors if no script name', () => {
			expect(() => {
				tool.createRunScriptPipeline(stubScriptArgs(), '');
			}).toThrow('Script name must be in kebab case (alphanumeric characters and dashes).');
		});

		it('errors if script name is not kebab-case', () => {
			expect(() => {
				tool.createRunScriptPipeline(stubScriptArgs(), 'fooBar');
			}).toThrow('Script name must be in kebab case (alphanumeric characters and dashes).');
		});

		it('sets args to context', () => {
			const pipeline = tool.createRunScriptPipeline(stubScriptArgs(), 'script-name');

			expect(pipeline.context.scriptName).toBe('script-name');
		});

		it('creates a pipeline with the `ScaffoldRoutine`', () => {
			const pipeline = tool.createRunScriptPipeline(stubScriptArgs(), 'script-name');
			const work = pipeline.getWorkUnits();

			expect(work).toEqual([expect.any(RunScriptRoutine)]);
			expect(work[0].title).toBe('Running script-name script');
		});

		it('emits `onRunScript` event', () => {
			const spy = jest.fn();

			tool.onRunScript.listen(spy, 'script-name');
			tool.createRunScriptPipeline(stubScriptArgs(), 'script-name');

			expect(spy).toHaveBeenCalledWith(tool.context);
		});
	});

	describe('createScaffoldPipeline()', () => {
		it('sets args to context', () => {
			const pipeline = tool.createScaffoldPipeline(stubScaffoldArgs(), 'a', 'b', 'c');

			expect(pipeline.context.generator).toBe('a');
			expect(pipeline.context.action).toBe('b');
			expect(pipeline.context.name).toBe('c');
		});

		it('creates a pipeline with the `ScaffoldRoutine`', () => {
			const pipeline = tool.createScaffoldPipeline(
				stubScaffoldArgs(),
				'generator',
				'action',
				'beemo',
			);
			const work = pipeline.getWorkUnits();

			expect(work).toEqual([expect.any(ScaffoldRoutine)]);
			expect(work[0].title).toBe('Generating from templates');
		});

		it('emits `onRunScaffold` event', () => {
			const spy = jest.fn();

			tool.onRunScaffold.listen(spy);
			tool.createScaffoldPipeline(stubScaffoldArgs(), 'generator', 'action', 'beemo');

			expect(spy).toHaveBeenCalledWith(tool.context, 'generator', 'action', 'beemo');
		});
	});
});
