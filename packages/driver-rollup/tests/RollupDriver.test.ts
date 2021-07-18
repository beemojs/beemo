import { mockTool } from '@beemo/core/test';
import factory from '../src';
import { RollupDriver } from '../src/RollupDriver';

describe('RollupDriver', () => {
	let driver: RollupDriver;

	beforeEach(() => {
		driver = new RollupDriver();
		driver.startup(mockTool());
	});

	it('index returns a driver instance', () => {
		expect(factory()).toBeInstanceOf(RollupDriver);
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
		driver = new RollupDriver({
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
				bin: 'rollup',
				configName: 'rollup.config.js',
				configOption: '--config',
				dependencies: [],
				description: 'Bundle source files with Rollup',
				filterOptions: true,
				helpOption: '--help',
				title: 'Rollup',
				useConfigOption: false,
			}),
		);
	});
});
