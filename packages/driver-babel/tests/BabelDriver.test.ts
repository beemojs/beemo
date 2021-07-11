import rimraf from 'rimraf';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/test';
import { BabelDriver } from '../src/BabelDriver';

jest.mock('rimraf');

describe('BabelDriver', () => {
	let driver: BabelDriver;
	let context: DriverContext;

	beforeEach(() => {
		driver = new BabelDriver();
		driver.startup(mockTool());

		context = stubDriverContext(driver);
	});

	it('sets options from constructor', () => {
		driver = new BabelDriver({
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
				bin: 'babel',
				configName: 'babel.config.js',
				configOption: '--config-file',
				commandOptions: {
					clean: {
						default: false,
						description: 'Clean the target folder',
						type: 'boolean',
					},
				},
				dependencies: [],
				description: 'Transpile files with Babel',
				filterOptions: true,
				helpOption: '--help',
				title: 'Babel',
				useConfigOption: false,
			}),
		);
	});

	describe('extractErrorMessage()', () => {
		it('returns an errors message', () => {
			expect(driver.extractErrorMessage(new Error('Oops'))).toBe('Oops');
		});

		it('removes stack trace at the end', () => {
			expect(
				driver.extractErrorMessage({
					message: `SyntaxError: /Users/milesj/Projects/beemo/packages/driver-babel/integration/fail.js: Support for the experimental syntax 'classPrivateProperties' isn't currently enabled (3:3):\n\n  1 | // Proposal requires plugin\n  2 | class Foo {\n> 3 |   #id = 123;\n    |   ^\n  4 | }\n  5 |\n\nAdd @babel/plugin-proposal-class-properties (https://git.io/vb4SL) to the 'plugins' section of your Babel config to enable transformation.\nIf you want to leave it as-is, add @babel/plugin-syntax-class-properties (https://git.io/vb4yQ) to the 'plugins' section to enable parsing.\n    at Parser._raise`,
				}),
			).toBe(
				`SyntaxError: /Users/milesj/Projects/beemo/packages/driver-babel/integration/fail.js: Support for the experimental syntax 'classPrivateProperties' isn't currently enabled (3:3):\n\n  1 | // Proposal requires plugin\n  2 | class Foo {\n> 3 |   #id = 123;\n    |   ^\n  4 | }\n  5 |\n\nAdd @babel/plugin-proposal-class-properties (https://git.io/vb4SL) to the 'plugins' section of your Babel config to enable transformation.\nIf you want to leave it as-is, add @babel/plugin-syntax-class-properties (https://git.io/vb4yQ) to the 'plugins' section to enable parsing.`,
			);
		});
	});

	describe('handleCleanTarget()', () => {
		it('doesnt run if no clean param', async () => {
			context.args.unknown.outDir = './lib';

			await driver.onBeforeExecute.emit([context, []]);

			expect(rimraf.sync).not.toHaveBeenCalled();
		});

		it('doesnt run if no outDir param', async () => {
			context.args.unknown.clean = '';

			await driver.onBeforeExecute.emit([context, []]);

			expect(rimraf.sync).not.toHaveBeenCalled();
		});

		it('runs if both params', async () => {
			context.args.unknown.outDir = './lib';
			context.args.unknown.clean = '';

			await driver.onBeforeExecute.emit([context, []]);

			expect(rimraf.sync).toHaveBeenCalledWith(Path.resolve('./lib').path());
		});
	});
});
