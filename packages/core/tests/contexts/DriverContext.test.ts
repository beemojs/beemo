import DriverContext from '../../src/contexts/DriverContext';
import Driver from '../../src/Driver';

describe('Context', () => {
  let context: DriverContext;

  beforeEach(() => {
    context = new DriverContext({ _: [], $0: '' }, new Driver());
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new DriverContext({ _: [], $0: '', foo: true }, new Driver());

      expect(context.args).toEqual({ _: [], $0: '', foo: true });
    });

    it('sets driver', () => {
      const driver = new Driver();
      driver.name = 'bar';

      context = new DriverContext({ _: [], $0: '' }, driver);

      expect(context.primaryDriver).toBe(driver);
      expect(context.driverName).toBe('bar');
    });
  });

  describe('addDriverDependency()', () => {
    it('adds a driver', () => {
      expect(Array.from(context.drivers)).toEqual([]);

      const driver = new Driver();

      context.addDriverDependency(driver);

      expect(Array.from(context.drivers)).toEqual([driver]);
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
