import DriverContext from '../../src/contexts/DriverContext';
import Driver from '../../src/Driver';
import { MOCK_DRIVER_ARGS } from '../../../../tests/helpers';

describe('Context', () => {
  let context: DriverContext;

  beforeEach(() => {
    context = new DriverContext(MOCK_DRIVER_ARGS, new Driver());
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new DriverContext({ ...MOCK_DRIVER_ARGS, workspaces: '*' }, new Driver());

      expect(context.args).toEqual({ ...MOCK_DRIVER_ARGS, workspaces: '*' });
    });

    it('sets driver', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext(MOCK_DRIVER_ARGS, driver);

      expect(context.primaryDriver).toBe(driver);
      expect(context.driverName).toBe('bar');
    });

    it('adds to driver list', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext(MOCK_DRIVER_ARGS, driver);

      expect(Array.from(context.drivers)).toEqual([driver]);
    });
  });

  describe('addDriverDependency()', () => {
    it('adds a driver', () => {
      expect(Array.from(context.drivers)).toEqual([context.primaryDriver]);

      const driver = new Driver();

      context.addDriverDependency(driver);

      expect(Array.from(context.drivers)).toEqual([context.primaryDriver, driver]);
    });

    it('errors when not a driver', () => {
      expect(() => {
        // @ts-ignore
        context.addDriverDependency(true);
      }).toThrowErrorMatchingSnapshot();
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
