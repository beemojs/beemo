import { DriverContext } from '../../src/contexts/DriverContext';
import { mockDriver, stubDriverArgs } from '../../src/test';

describe('DriverContext', () => {
	let context: DriverContext;

	beforeEach(() => {
		context = new DriverContext(stubDriverArgs(), mockDriver('foo'));
	});

	describe('constructor()', () => {
		it('sets args', () => {
			context = new DriverContext(stubDriverArgs({ workspaces: '*' }), mockDriver('foo'));

			expect(context.args).toEqual(stubDriverArgs({ workspaces: '*' }));
		});

		it('sets driver', () => {
			const driver = mockDriver('bar');

			context = new DriverContext(stubDriverArgs(), driver);

			expect(context.primaryDriver).toBe(driver);
			expect(context.driverName).toBe('bar');
		});

		it('adds to driver list', () => {
			const driver = mockDriver('bar');

			context = new DriverContext(stubDriverArgs(), driver);

			expect([...context.drivers]).toEqual([driver]);
		});
	});

	describe('addParallelCommand()', () => {
		it('adds a new command argvs', () => {
			expect(context.parallelArgv).toEqual([]);

			context.addParallelCommand(['--foo', 'bar']);
			context.addParallelCommand(['--baz=123']);

			expect(context.parallelArgv).toEqual([['--foo', 'bar'], ['--baz=123']]);
		});
	});
});
