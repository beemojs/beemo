import fs from 'fs';
import rimraf from 'rimraf';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/test';
import { getFixturePath } from '@boost/test-utils';
import { TypeScriptDriver } from '../src/TypeScriptDriver';

jest.mock('rimraf');

const PROJECT_REFS_FIXTURE_PATH = new Path(getFixturePath('project-refs'));

describe('TypeScriptDriver', () => {
	let driver: TypeScriptDriver;
	let context: DriverContext;
	let writeSpy: jest.SpyInstance;

	beforeEach(() => {
		const tool = mockTool();
		// @ts-expect-error Overwrite readonly
		tool.project.root = new Path(getFixturePath('project-refs'));

		driver = new TypeScriptDriver();
		driver.startup(tool);
		driver.config = {
			compilerOptions: {},
		};

		context = stubDriverContext(driver);

		writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation((fp, config, cb) => {
			(cb as Function)(null);
		});
	});

	afterEach(() => {
		writeSpy.mockRestore();
	});

	it('sets options from constructor', () => {
		driver = new TypeScriptDriver({
			args: ['--foo', '--bar=1'],
			dependencies: ['babel'],
			env: { DEV: 'true' },
			localTypes: false,
		});

		expect(driver.options).toEqual({
			args: ['--foo', '--bar=1'],
			declarationOnly: false,
			dependencies: ['babel'],
			env: { DEV: 'true' },
			expandGlobs: true,
			strategy: 'native',
			buildFolder: 'lib',
			globalTypes: true,
			localTypes: false,
			srcFolder: 'src',
			testsFolder: 'tests',
			typesFolder: 'types',
			template: '',
		});
	});

	it('sets correct metadata', () => {
		expect(driver.metadata).toEqual({
			bin: 'tsc',
			commandOptions: {
				clean: {
					default: false,
					description: 'Clean the target folder',
					type: 'boolean',
				},
			},
			configName: 'tsconfig.json',
			configOption: '',
			configStrategy: 'create',
			dependencies: [],
			description: 'Type check files with TypeScript',
			filterOptions: true,
			helpOption: '--help --all',
			title: 'TypeScript',
			useConfigOption: false,
			versionOption: '--version',
			watchOptions: ['-w', '--watch'],
			workspaceStrategy: 'copy',
		});
	});

	describe('handleCleanTarget()', () => {
		it('doesnt run if no config', async () => {
			driver.config = {};

			await driver.handleCleanTarget(context);

			expect(rimraf.sync).not.toHaveBeenCalled();
		});

		it('doesnt run if no --clean param', async () => {
			driver.config.compilerOptions = { outDir: './lib' };

			await driver.handleCleanTarget(context);

			expect(rimraf.sync).not.toHaveBeenCalled();
		});

		it('doesnt run if no outDir param', async () => {
			context.args.unknown.clean = '';
			driver.config.compilerOptions = {};

			await driver.handleCleanTarget(context);

			expect(rimraf.sync).not.toHaveBeenCalled();
		});

		it('runs if both params', async () => {
			context.args.unknown.clean = '';
			driver.config.compilerOptions = { outDir: './lib' };

			await driver.handleCleanTarget(context);

			expect(rimraf.sync).toHaveBeenCalledWith(Path.resolve('./lib').path());
		});
	});

	describe('handlePrepareConfigs()', () => {
		it('removes `compilerOptions` from config object', () => {
			const config = {
				compileOnSave: true,
				compilerOptions: {
					noEmit: true,
				},
			};

			driver.handlePrepareConfigs(
				context,
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json'),
				config,
			);

			expect(config.compilerOptions).toBeUndefined();
		});

		it('removes `include` and `exclude` from config object', () => {
			const config = {
				include: ['src/**/*'],
				exclude: ['tests/**/*'],
			};

			driver.handlePrepareConfigs(
				context,
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json'),
				config,
			);

			expect(config.include).toBeUndefined();
			expect(config.exclude).toBeUndefined();
		});

		it('writes `compilerOptions` to a new file while adding new fields', () => {
			const config = {
				compileOnSave: true,
				compilerOptions: {
					noEmit: true,
				},
			};

			driver.handlePrepareConfigs(
				context,
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json'),
				config,
			);

			expect(writeSpy).toHaveBeenCalledWith(
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.options.json').path(),
				driver.formatConfig({
					compilerOptions: {
						noEmit: true,
						composite: true,
						declaration: true,
						declarationMap: true,
						outDir: undefined,
						outFile: undefined,
					},
				}),
				expect.any(Function),
			);
		});

		it('sets `references`, `files`, and `extends` on base config object', () => {
			const config = {
				compilerOptions: {
					noEmit: true,
				},
			};

			driver.handlePrepareConfigs(
				context,
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json'),
				config,
			);

			expect(config).toEqual({
				extends: './tsconfig.options.json',
				files: [],
				references: [
					{ path: 'packages/bar' },
					{ path: 'packages/baz' },
					{ path: 'packages/baz/tests' },
					{ path: 'packages/foo' },
				],
			});
		});

		it('includes `testsFolder` when using a custom value', () => {
			const config = {};

			driver.configure({ testsFolder: 'custom-tests' });

			driver.handlePrepareConfigs(
				context,
				PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json'),
				config,
			);

			expect(config).toEqual({
				extends: './tsconfig.options.json',
				files: [],
				references: [
					{ path: 'packages/bar' },
					{ path: 'packages/baz' },
					{ path: 'packages/foo' },
					{ path: 'packages/foo/custom-tests' },
				],
			});
		});
	});
});
