import { Tool } from 'boost';
import ConfigureRoutine from '../src/ConfigureRoutine';
import { createDriver, createDriverContext, setupMockTool } from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('ConfigureRoutine', () => {
  let routine;
  let plugins;
  let tool;

  beforeEach(() => {
    plugins = {};
    tool = setupMockTool(new Tool());

    routine = new ConfigureRoutine('config', 'Generating configurations');
    routine.context = createDriverContext(createDriver('foo'), tool);
    routine.tool = tool;
    routine.tool.getPlugin.mockImplementation(name => plugins[name] || createDriver(name, tool));
    routine.debug = jest.fn();
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
      routine.serializeSubroutines = jest.fn();
      routine.parallelizeSubroutines = jest.fn();
    });

    it('serializes if `parallel` config is false', async () => {
      routine.tool.config.config.parallel = false;

      await routine.execute();

      expect(routine.serializeSubroutines).toHaveBeenCalled();
      expect(routine.parallelizeSubroutines).not.toHaveBeenCalled();
    });

    it('parallelizes if `parallel` config is true', async () => {
      await routine.execute();

      expect(routine.serializeSubroutines).not.toHaveBeenCalled();
      expect(routine.parallelizeSubroutines).toHaveBeenCalled();
    });
  });

  describe('setupConfigFiles()', () => {
    it('pipes a routine for each driver', async () => {
      const foo = createDriver('foo');
      const bar = createDriver('bar');
      const baz = createDriver('baz');

      expect(routine.subroutines).toHaveLength(0);

      routine.context.drivers = [foo, bar, baz];

      await routine.setupConfigFiles();

      expect(routine.subroutines).toHaveLength(3);

      expect(routine.subroutines[0].key).toBe('foo');
      expect(routine.subroutines[0].options.driver).toBe(foo);
      expect(routine.subroutines[1].key).toBe('bar');
      expect(routine.subroutines[1].options.driver).toBe(bar);
      expect(routine.subroutines[2].key).toBe('baz');
      expect(routine.subroutines[2].options.driver).toBe(baz);
    });
  });

  describe('resolveDependencies()', () => {
    it('adds primary driver when no dependencies', async () => {
      await routine.resolveDependencies();

      expect(routine.context.drivers).toEqual([routine.context.primaryDriver]);
    });

    it('adds dependency to driver list', async () => {
      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(routine.context.drivers).toEqual([
        createDriver('bar', tool),
        routine.context.primaryDriver,
      ]);
    });

    it('handles sub-dependencies', async () => {
      plugins.bar = createDriver('bar', tool, { dependencies: ['baz', 'qux'] });
      plugins.baz = createDriver('baz', tool);
      plugins.qux = createDriver('qux', tool, { dependencies: ['oof'] });
      plugins.oof = createDriver('oof', tool);

      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(routine.context.drivers).toEqual([
        plugins.oof,
        plugins.qux,
        plugins.baz,
        plugins.bar,
        routine.context.primaryDriver,
      ]);
    });

    it('triggers `resolve-dependencies` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(spy).toHaveBeenCalledWith('resolve-dependencies', [routine.context.drivers]);
    });
  });
});
