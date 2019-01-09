import DriverContext from '../../src/contexts/DriverContext';
import Driver from '../../src/Driver';
import { MOCK_DRIVER_ARGS } from '../../../../tests/helpers';

describe('DriverContext', () => {
  let context: DriverContext;

  beforeEach(() => {
    context = new DriverContext({ ...MOCK_DRIVER_ARGS }, new Driver());
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
      expect(context.eventName).toBe('bar');
    });

    it('adds to driver list', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext(MOCK_DRIVER_ARGS, driver);

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
