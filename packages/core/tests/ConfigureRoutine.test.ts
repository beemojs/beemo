import { Tool } from 'boost';
import ConfigureRoutine from '../src/ConfigureRoutine';
import Driver from '../src/Driver';
import {
  createDriver,
  createDriverContext,
  setupMockTool,
  createTestDebugger,
} from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

describe('ConfigureRoutine', () => {
  let routine: ConfigureRoutine;
  let plugins: { [name: string]: Driver<any> };
  let tool: Tool<any>;

  beforeEach(() => {
    plugins = {};
    tool = setupMockTool(new Tool({}));

    routine = new ConfigureRoutine('config', 'Generating configurations');
    routine.tool = tool;
    routine.context = createDriverContext(createDriver('foo'));
    routine.debug = createTestDebugger();

    (routine.tool.getPlugin as jest.Mock).mockImplementation(
      name => plugins[name] || createDriver(name, tool),
    );
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
      routine.tool.config.config.parallel = false;

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
      const foo = createDriver('foo');
      const bar = createDriver('bar');
      const baz = createDriver('baz');

      expect(routine.routines).toHaveLength(0);

      routine.context.drivers = [foo, bar, baz];

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

      expect(routine.context.drivers).toEqual([routine.context.primaryDriver]);
    });

    it('adds dependency to driver list', async () => {
      routine.context.primaryDriver.metadata.dependencies = ['bar'];

      await routine.resolveDependencies();

      expect(routine.context.drivers).toEqual([
        routine.context.primaryDriver,
        createDriver('bar', tool),
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
        routine.context.primaryDriver,
        plugins.bar,
        plugins.baz,
        plugins.qux,
        plugins.oof,
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
