import Beemo from '../../src/Beemo';
import ResolveConfigsRoutine from '../../src/routines/ResolveConfigsRoutine';
import Driver from '../../src/Driver';
import { mockTool, mockDebugger, mockDriver, stubConfigContext } from '../../src/testUtils';

describe('ResolveConfigsRoutine', () => {
  let routine: ResolveConfigsRoutine;
  let plugins: { [name: string]: Driver };
  let tool: Beemo;
  let driver: Driver;

  beforeEach(() => {
    plugins = {};
    tool = mockTool();
    driver = mockDriver('foo', tool);

    routine = new ResolveConfigsRoutine('config', 'Generating configurations');
    routine.tool = tool;
    routine.context = stubConfigContext();
    routine.debug = mockDebugger();

    routine.context.addDriverDependency(driver);

    jest
      .spyOn(routine.tool, 'getPlugin')
      .mockImplementation((type, name) => plugins[name] || mockDriver(name, tool));
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
      jest.spyOn(routine, 'serializeRoutines').mockImplementation();
      jest.spyOn(routine, 'parallelizeRoutines').mockImplementation();
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
      const foo = mockDriver('foo', tool);
      const bar = mockDriver('bar', tool);
      const baz = mockDriver('baz', tool);

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

    it('emits `onResolveDependencies` event', async () => {
      const spy = jest.fn();

      routine.tool.onResolveDependencies.listen(spy);

      driver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(spy).toHaveBeenCalledWith(routine.context, Array.from(routine.context.drivers));
    });
  });
});
