import fs from 'fs';
import { DriverContext, Path } from '@beemo/core';
import {
	mockNormalizedFilePath,
	mockTool,
	normalizeSeparators,
	stubDriverContext,
	stubExecResult,
} from '@beemo/core/test';
import factory from '../src';
import { StylelintDriver } from '../src/StylelintDriver';

describe('StylelintDriver', () => {
	let driver: StylelintDriver;
	let context: DriverContext;
	let writeSpy: jest.SpyInstance;

	beforeEach(() => {
		driver = new StylelintDriver();
		driver.startup(mockTool());

		context = stubDriverContext(driver);

		writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
	});

	afterEach(() => {
		writeSpy.mockRestore();
	});

	it('index returns a driver instance', () => {
		expect(factory()).toBeInstanceOf(StylelintDriver);
	});

	it('can pass options through factory', () => {
		driver = factory({ args: ['--foo'] });

		expect(driver.options).toEqual(
			expect.objectContaining({
				args: ['--foo'],
			}),
		);
	});

	it('sets options from constructor', () => {
		driver = new StylelintDriver({
			args: ['--foo', '--bar=1'],
			dependencies: ['babel'],
			env: { DEV: 'true' },
		});

		expect(driver.options).toEqual({
			args: ['--foo', '--bar=1'],
			configStrategy: 'native',
			dependencies: ['babel'],
			env: { DEV: 'true' },
			expandGlobs: true,
			outputStrategy: 'buffer',
			template: '',
		});
	});

	it('sets correct metadata', () => {
		expect(driver.metadata).toEqual(
			expect.objectContaining({
				bin: 'stylelint',
				configName: '.stylelintrc.js',
				configOption: '--config',
				dependencies: [],
				description: 'Lint styles with stylelint',
				filterOptions: true,
				helpOption: '--help',
				title: 'stylelint',
				useConfigOption: false,
			}),
		);
	});

	describe('mergeConfig()', () => {
		it('merges arrays by unique value', () => {
			expect(
				driver.mergeConfig(
					{
						extends: 'abc',
						rules: {
							foo: 'error',
						},
					},
					{
						rules: {
							foo: ['error', 'always'],
						},
					},
				),
			).toEqual({
				extends: 'abc',
				rules: {
					foo: ['error', 'always'],
				},
			});
		});

		it('merges ignore list correctly', () => {
			expect(
				driver.mergeConfig(
					{
						ignore: ['foo', 'bar'],
					},
					{
						ignore: ['baz', 'foo'],
					},
				),
			).toEqual({
				ignore: ['foo', 'bar', 'baz'],
			});
		});
	});

	describe('processFailure()', () => {
		it('outputs stderr and stdout', () => {
			driver.processFailure(
				stubExecResult({
					command: 'stylelint',
					stderr: 'Error',
				}),
			);

			expect(driver.output.stderr).toBe('Error');
		});
	});

	describe('handleCreateIgnoreFile()', () => {
		it('does nothing if no ignore field', () => {
			const config = { extends: 'abc' };

			driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

			expect(config).toEqual({ extends: 'abc' });
		});

		it('errors if not an array or string', () => {
			expect(() => {
				driver.onCreateConfigFile.emit([
					context,
					new Path('/some/path/.stylelintrc.js'),
					{
						// @ts-expect-error Invalid type
						ignore: 'abc',
					},
				]);
			}).toThrowErrorMatchingSnapshot();
		});

		it('creates ignore file and updates references', () => {
			const config = {
				extends: 'abc',
				ignore: ['foo', 'bar', 'baz'],
			};

			driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

			expect(writeSpy).toHaveBeenCalledWith(
				normalizeSeparators('/some/path/.stylelintignore'),
				'foo\nbar\nbaz',
			);

			expect(context.configPaths).toEqual([
				{ driver: 'stylelint', path: mockNormalizedFilePath('/some/path/.stylelintignore') },
			]);

			expect(config).toEqual({ extends: 'abc' });
		});

		it('emits `onCreateIgnoreFile` event', () => {
			const createSpy = jest.fn((ctx, path, config) => {
				config.ignore.push('qux');
			});

			driver.onCreateIgnoreFile.listen(createSpy);

			const config = {
				extends: 'abc',
				ignore: ['foo', 'bar', 'baz'],
			};

			driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

			expect(createSpy).toHaveBeenCalledWith(
				context,
				mockNormalizedFilePath('/some/path/.stylelintignore'),
				{
					ignore: ['foo', 'bar', 'baz', 'qux'],
				},
			);

			expect(writeSpy).toHaveBeenCalledWith(
				normalizeSeparators('/some/path/.stylelintignore'),
				'foo\nbar\nbaz\nqux',
			);
		});
	});
});
