import fs from 'fs';
import { Path, Tool } from '@beemo/core';
import { mockTool, normalizeSeparators } from '@beemo/core/test';
import { getFixturePath } from '@boost/test-utils';
import { syncProjectRefs } from '../../src/commands/syncProjectRefs';
import { TypeScriptDriver } from '../../src/TypeScriptDriver';

describe('syncProjectRefs()', () => {
	let tool: Tool;
	let driver: TypeScriptDriver;
	let writeSpy: jest.SpyInstance;

	beforeEach(async () => {
		tool = mockTool();
		// @ts-expect-error Overwrite readonly
		tool.project.root = new Path(getFixturePath('project-refs'));

		driver = new TypeScriptDriver();

		await tool.driverRegistry.register('typescript', driver, tool);

		writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation((fp, config, cb) => {
			(cb as Function)(null);
		});
	});

	afterEach(() => {
		writeSpy.mockRestore();
	});

	it('creates a source and optional test config in each package root', async () => {
		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/bar/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*', '../../types/**/*'],
				references: [{ path: '../foo' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*', '../../types/**/*'],
				references: [{ path: '../foo' }, { path: '../bar' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tests/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					composite: false,
					emitDeclarationOnly: false,
					noEmit: true,
					rootDir: '.',
				},
				extends: '../../../tsconfig.options.json',
				include: ['**/*', '../types/**/*', '../../../types/**/*'],
				references: [{ path: '..' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/foo/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'tests', 'some/path'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*', '../../types/**/*'],
				references: [],
			}),
			expect.any(Function),
		);
	});

	it('supports emitting `declarationOnly', async () => {
		driver.configure({
			declarationOnly: true,
		});

		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/bar/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
					emitDeclarationOnly: true,
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*', '../../types/**/*'],
				references: [{ path: '../foo' }],
			}),
			expect.any(Function),
		);
	});

	it('supports custom `srcFolder` and `buildFolder`', async () => {
		driver.configure({
			buildFolder: 'build',
			srcFolder: 'source',
		});

		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/qux/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'build',
					outDir: 'build',
					rootDir: 'source',
				},
				exclude: ['build', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['source/**/*', 'types/**/*', '../../types/**/*'],
				references: [],
			}),
			expect.anything(),
		);
	});

	it('supports custom `typesFolder` and `testsFolder`', async () => {
		driver.configure({
			typesFolder: 'typings',
			testsFolder: 'custom-tests',
		});

		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/foo/custom-tests/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					composite: false,
					emitDeclarationOnly: false,
					noEmit: true,
					rootDir: '.',
				},
				extends: '../../../tsconfig.options.json',
				include: ['**/*', '../typings/**/*', '../../../typings/**/*'],
				references: [{ path: '..' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/foo/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'custom-tests', 'some/path'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'typings/**/*', '../../typings/**/*'],
				references: [],
			}),
			expect.any(Function),
		);
	});

	it('excludes local types when `localTypes` is false', async () => {
		driver.configure({ localTypes: false });

		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', '../../types/**/*'],
				references: [{ path: '../foo' }, { path: '../bar' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tests/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					composite: false,
					emitDeclarationOnly: false,
					noEmit: true,
					rootDir: '.',
				},
				extends: '../../../tsconfig.options.json',
				include: ['**/*', '../../../types/**/*'],
				references: [{ path: '..' }],
			}),
			expect.any(Function),
		);
	});

	it('excludes global types when `globalTypes` is false', async () => {
		driver.configure({ globalTypes: false });

		await syncProjectRefs(tool);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*'],
				references: [{ path: '../foo' }, { path: '../bar' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tests/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					composite: false,
					emitDeclarationOnly: false,
					noEmit: true,
					rootDir: '.',
				},
				extends: '../../../tsconfig.options.json',
				include: ['**/*', '../types/**/*'],
				references: [{ path: '..' }],
			}),
			expect.any(Function),
		);
	});

	it('emits `onCreateProjectConfigFile` event', async () => {
		const spy = jest.fn((filePath, config, isTests) => {
			if (isTests) {
				// eslint-disable-next-line no-param-reassign
				config.compilerOptions.testsOnly = true;
			} else {
				// eslint-disable-next-line no-param-reassign
				config.compilerOptions.srcOnly = true;
			}
		});

		driver.onCreateProjectConfigFile.listen(spy);

		await syncProjectRefs(tool);

		expect(spy).toHaveBeenCalledTimes(4);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tests/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					composite: false,
					emitDeclarationOnly: false,
					noEmit: true,
					rootDir: '.',
					// @ts-expect-error Testing purposes
					testsOnly: true,
				},
				extends: '../../../tsconfig.options.json',
				include: ['**/*', '../types/**/*', '../../../types/**/*'],
				references: [{ path: '..' }],
			}),
			expect.any(Function),
		);

		expect(writeSpy).toHaveBeenCalledWith(
			expect.stringContaining(normalizeSeparators('packages/baz/tsconfig.json')),
			driver.formatConfig({
				compilerOptions: {
					declarationDir: 'lib',
					outDir: 'lib',
					rootDir: 'src',
					// @ts-expect-error Testing purposes
					srcOnly: true,
				},
				exclude: ['lib', 'tests'],
				extends: '../../tsconfig.options.json',
				include: ['src/**/*', 'types/**/*', '../../types/**/*'],
				references: [{ path: '../foo' }, { path: '../bar' }],
			}),
			expect.any(Function),
		);
	});
});
