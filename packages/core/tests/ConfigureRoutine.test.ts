import ConfigureRoutine from '../src/ConfigureRoutine';
import Driver from '../src/Driver';
import { BeemoTool } from '../src/types';
import { mockTool, mockDebugger, mockDriver, stubConfigContext } from '../src/testUtils';

describe('ConfigureRoutine', () => {
  let routine: ConfigureRoutine;
  let plugins: { [name: string]: Driver };
  let tool: BeemoTool;
  let driver: Driver;

  beforeEach(() => {
    plugins = {};
    tool = mockTool();
    driver = mockDriver('foo');

    routine = new ConfigureRoutine('config', 'Generating configurations');
    routine.tool = tool;
    routine.context = stubConfigContext();
    routine.debug = mockDebugger();

    routine.context.addDriverDependency(driver);
    routine.tool.getPlugin = jest.fn((type, name) => plugins[name] || mockDriver(name, tool));
  });

  describe('bootstrap()', () => {
    it('bootstraps pipeline in order', async () => {
      const resSpy = jest.spyOn(routine, 'resolveDependencies');
      const confSpy = jest.spyOn(routine, 'setupConfigFiles');

      await routine.bootstrap();

      expect(resSpy).toHaveBeenCalled();
      expect(confSpy).toHaveBeenCalled();
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      routine.serializeRoutines = jest.fn();
      routine.parallelizeRoutines = jest.fn();
    });

    it('serializes if `parallel` config is false', async () => {
      routine.tool.config.configure.parallel = false;

      await routine.execute();

      expect(routine.serializeRoutines).toHaveBeenCalled();
      expect(routine.parallelizeRoutines).not.toHaveBeenCalled();
    });

    it('parallelizes if `parallel` config is true', async () => {
      await routine.execute();

      expect(routine.serializeRoutines).not.toHaveBeenCalled();
      expect(routine.parallelizeRoutines).toHaveBeenCalled();
    });
  });

  describe('setupConfigFiles()', () => {
    it('pipes a routine for each driver', async () => {
      const foo = mockDriver('foo');
      const bar = mockDriver('bar');
      const baz = mockDriver('baz');

      expect(routine.routines).toHaveLength(0);

      routine.context.drivers = new Set([foo, bar, baz]);

      await routine.setupConfigFiles();

      expect(routine.routines).toHaveLength(3);

      expect(routine.routines[0].key).toBe('baz');
      // @ts-ignore
      expect(routine.routines[0].options.driver).toBe(baz);
      expect(routine.routines[1].key).toBe('bar');
      // @ts-ignore
      expect(routine.routines[1].options.driver).toBe(bar);
      expect(routine.routines[2].key).toBe('foo');
      // @ts-ignore
      expect(routine.routines[2].options.driver).toBe(foo);
    });
  });

  describe('resolveDependencies()', () => {
    it('adds primary driver when no dependencies', async () => {
      await routine.resolveDependencies();

      expect(Array.from(routine.context.drivers)).toEqual([driver]);
    });

    it('adds dependency to driver list', async () => {
      driver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(Array.from(routine.context.drivers)).toEqual([driver, mockDriver('bar', tool)]);
    });

    it('handles sub-dependencies', async () => {
      plugins.bar = mockDriver('bar', tool, { dependencies: ['baz', 'qux'] });
      plugins.baz = mockDriver('baz', tool);
      plugins.qux = mockDriver('qux', tool, { dependencies: ['oof'] });
      plugins.oof = mockDriver('oof', tool);

      driver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(Array.from(routine.context.drivers)).toEqual([
        driver,
        plugins.bar,
        plugins.baz,
        plugins.qux,
        plugins.oof,
      ]);
    });

    it('triggers `resolve-dependencies` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      driver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(spy).toHaveBeenCalledWith('beemo.resolve-dependencies', [
        routine.context,
        Array.from(routine.context.drivers),
      ]);
    });
  });
});
