import { mockTool } from '@beemo/core/test';
import factory from '../src';
import { WebpackDriver } from '../src/WebpackDriver';

describe('WebpackDriver', () => {
	let driver: WebpackDriver;

	beforeEach(() => {
		driver = new WebpackDriver();
		driver.startup(mockTool());
	});

	it('index returns a driver instance', () => {
		expect(factory()).toBeInstanceOf(WebpackDriver);
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
		driver = new WebpackDriver({
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
				bin: 'webpack',
				configName: 'webpack.config.js',
				configOption: '--config',
				dependencies: [],
				description: 'Bundle source files with Webpack',
				filterOptions: true,
				helpOption: '--help',
				title: 'Webpack',
				useConfigOption: false,
			}),
		);
	});
});
