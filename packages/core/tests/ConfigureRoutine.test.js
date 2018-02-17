import ConfigureRoutine from '../src/ConfigureRoutine';
import Driver from '../src/Driver';

describe('ConfigureRoutine', () => {
  let routine;
  let plugins = {};

  function createDriver(name, dependencies = []) {
    const driver = new Driver();
    driver.name = name;
    driver.metadata = {
      dependencies,
      title: name,
    };

    return driver;
  }

  beforeEach(() => {
    plugins = {};

    routine = new ConfigureRoutine('config', 'Generating configurations');
    routine.context = {
      driverName: 'foo',
      drivers: [],
      primaryDriver: createDriver('foo'),
    };
    routine.tool = {
      config: {
        config: {
          parallel: true,
        },
      },
      debug() {},
      emit() {},
      getPlugin(name) {
        return plugins[name] || createDriver(name);
      },
      on() {},
    };
  });

  describe('createConfigFiles()', () => {
    beforeEach(() => {
      routine.serializeSubroutines = jest.fn();
      routine.parallelizeSubroutines = jest.fn();
    });

    it('pipes a routine for each driver', async () => {
      const foo = createDriver('foo');
      const bar = createDriver('bar');
      const baz = createDriver('baz');

      expect(routine.subroutines).toHaveLength(0);

      await routine.createConfigFiles([foo, bar, baz]);

      expect(routine.subroutines).toHaveLength(3);

      expect(routine.subroutines[0].key).toBe('foo');
      expect(routine.subroutines[0].driver).toBe(foo);
      expect(routine.subroutines[1].key).toBe('bar');
      expect(routine.subroutines[1].driver).toBe(bar);
      expect(routine.subroutines[2].key).toBe('baz');
      expect(routine.subroutines[2].driver).toBe(baz);
    });

    it('serializes if `parallel` config is false', async () => {
      routine.tool.config.config.parallel = false;

      await routine.createConfigFiles([createDriver('foo')]);

      expect(routine.serializeSubroutines).toHaveBeenCalled();
      expect(routine.parallelizeSubroutines).not.toHaveBeenCalled();
    });

    it('parallelizes if `parallel` config is true', async () => {
      await routine.createConfigFiles([createDriver('foo')]);

      expect(routine.serializeSubroutines).not.toHaveBeenCalled();
      expect(routine.parallelizeSubroutines).toHaveBeenCalled();
    });
  });

  describe('resolveDependencies()', () => {
    it('adds primary driver when no dependencies', async () => {
      const drivers = await routine.resolveDependencies();

      expect(drivers).toEqual([routine.context.primaryDriver]);
      expect(routine.context.drivers).toEqual(drivers);
    });

    it('adds dependency to driver list', async () => {
      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      const drivers = await routine.resolveDependencies();
      const bar = createDriver('bar');

      expect(drivers).toEqual([bar, routine.context.primaryDriver]);
      expect(routine.context.drivers).toEqual(drivers);
    });

    it('handles sub-dependencies', async () => {
      plugins.bar = createDriver('bar', ['baz', 'qux']);
      plugins.baz = createDriver('baz');
      plugins.qux = createDriver('qux', ['oof']);
      plugins.oof = createDriver('oof');

      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      const drivers = await routine.resolveDependencies();

      expect(drivers).toEqual([
        plugins.oof,
        plugins.qux,
        plugins.baz,
        plugins.bar,
        routine.context.primaryDriver,
      ]);
      expect(routine.context.drivers).toEqual(drivers);
    });
  });
});
