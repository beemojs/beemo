import ConfigureRoutine from '../src/ConfigureRoutine';
import Driver from '../src/Driver';

describe('ConfigureRoutine', () => {
  let routine;
  let plugins = {};

  function createDriver(name, dependencies = []) {
    const driver = new Driver();
    driver.name = name;
    driver.metadata = { dependencies };

    return driver;
  }

  beforeEach(() => {
    routine = new ConfigureRoutine('config', 'Generating configurations');
    routine.context = {
      drivers: [],
      driverName: 'foo',
      primaryDriver: createDriver('foo'),
    };
    routine.tool = {
      debug() {},
      emit() {},
      getPlugin(name) {
        return plugins[name] || createDriver(name);
      },
    };
  });

  describe.skip('createConfigFiles()');

  describe('resolveDependencies()', () => {
    it('adds primary driver when no dependencies', async () => {
      const drivers = await routine.resolveDependencies();

      expect(drivers).toEqual([
        routine.context.primaryDriver,
      ]);
      expect(routine.context.drivers).toEqual(drivers);
    });

    it('adds dependency to driver list', async () => {
      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      const drivers = await routine.resolveDependencies();
      const bar = createDriver('bar');

      expect(drivers).toEqual([
        bar,
        routine.context.primaryDriver,
      ]);
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
