import DriverContext from '../../src/contexts/DriverContext';
import Driver from '../../src/Driver';
import { stubDriverArgs } from '../../src/testUtils';

describe('DriverContext', () => {
  let context: DriverContext;

  beforeEach(() => {
    context = new DriverContext(stubDriverArgs(), new Driver());
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new DriverContext(stubDriverArgs({ workspaces: '*' }), new Driver());

      expect(context.args).toEqual(stubDriverArgs({ workspaces: '*' }));
    });

    it('sets driver', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext(stubDriverArgs(), driver);

      expect(context.primaryDriver).toBe(driver);
      expect(context.driverName).toBe('bar');
      expect(context.eventName).toBe('bar');
    });

    it('adds to driver list', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext(stubDriverArgs(), driver);

      expect(Array.from(context.drivers)).toEqual([driver]);
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
