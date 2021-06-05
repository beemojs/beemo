import { ConfigContext } from '../../src/contexts/ConfigContext';
import { mockDriver, stubArgs } from '../../src/test';

describe('ConfigContext', () => {
	let context: ConfigContext;

	beforeEach(() => {
		context = new ConfigContext(stubArgs({}));
	});

	describe('constructor()', () => {
		it('sets args', () => {
			context = new ConfigContext(stubArgs({ names: ['*'] }));

			expect(context.args).toEqual(stubArgs({ names: ['*'] }));
		});
	});

	describe('addDriverDependency()', () => {
		it('adds a driver', () => {
			expect([...context.drivers]).toEqual([]);

			const driver = mockDriver('test');

			context.addDriverDependency(driver);

			expect([...context.drivers]).toEqual([driver]);
		});

		it('errors when not a driver', () => {
			expect(() => {
				// @ts-expect-error Allow invalid type
				context.addDriverDependency(true);
			}).toThrowErrorMatchingSnapshot();
		});
	});
});
