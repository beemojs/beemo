import { mockTool } from '@beemo/core/test';
import { RollupDriver } from '../src/RollupDriver';

describe('RollupDriver', () => {
	let driver: RollupDriver;

	beforeEach(() => {
		driver = new RollupDriver();
		driver.startup(mockTool());
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
