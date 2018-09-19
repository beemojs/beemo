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

  describe('findConfigByName()', () => {
    const configFoo = { driver: 'foo', path: '/some/path/foo.js' };

    it('returns nothing if not found', () => {
      expect(context.findConfigByName('foo.js')).toBeUndefined();
    });

    it('returns path if found', () => {
      context.configPaths.push(configFoo);

      expect(context.findConfigByName('foo.js')).toBe(configFoo);
    });

    it('returns driver name if found', () => {
      context.configPaths.push(configFoo);

      expect(context.findConfigByName('foo')).toBe(configFoo);
    });

    it('only checks file base name', () => {
      context.configPaths.push({ driver: 'foo', path: '/some/path/foo.js/other/file.js' });

      expect(context.findConfigByName('foo.js')).toBeUndefined();
    });
  });
});
