import ModuleLoader from '@boost/core/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import Script from '../src/Script';
import {
  prependRoot,
  createScriptContext,
  createTestDebugger,
  createTestTool,
} from '../../../tests/helpers';

jest.mock('@boost/core/lib/ModuleLoader', () =>
  jest.fn(() => ({
    importModule: jest.fn(tempName => {
      const path = require.requireActual('path');
      const kebabCase = require.requireActual('lodash/kebabCase');
      let name = tempName.includes('/') ? path.basename(tempName) : tempName;

      if (tempName.endsWith('Missing.js') || tempName === 'missing') {
        throw new Error(`Script "${name}" missing!`);
      }

      name = kebabCase(name.replace('.js', ''));

      return {
        name,
        moduleName: `beemo-script-${name}`,
        args: jest.fn(() => ({})),
        boostrap: jest.fn(),
        execute: () => Promise.resolve(123),
      };
    }),
  })),
);

describe('ExecuteScriptRoutine', () => {
  let routine: ExecuteScriptRoutine;

  beforeEach(() => {
    routine = new ExecuteScriptRoutine('script', 'Executing script');
    routine.context = createScriptContext();
    routine.tool = createTestTool();
    routine.debug = createTestDebugger();

    routine.context.scriptName = 'FooBar';
    routine.context.eventName = 'foo-bar';

    // TEMP
    routine.tool.registerPlugin('script', Script);
    routine.tool.addPlugin = jest.fn();

    // @ts-ignore
    ModuleLoader.mockClear();
  });

  describe('execute()', () => {
    it('executes pipeline in order', async () => {
      const loadSpy = jest.spyOn(routine, 'loadScript');
      const runSpy = jest.spyOn(routine, 'runScript');

      routine.bootstrap();

      const response = await routine.execute();

      expect(loadSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(runSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({
          name: 'foo-bar',
        }),
        expect.anything(),
      );
      expect(response).toBe(123);
    });
  });

  describe('loadScript()', () => {
    it('loads as a file from configuration module', () => {
      const script = routine.loadScript(routine.context);

      expect(script).toEqual(
        expect.objectContaining({
          name: 'foo-bar',
          moduleName: 'beemo-script-foo-bar',
        }),
      );
    });

    it('sets file path to context', () => {
      const script = routine.loadScript(routine.context);

      expect(script.name).toBe('foo-bar');
      expect(routine.context).toEqual(
        expect.objectContaining({
          scriptName: 'FooBar',
          path: prependRoot('scripts/FooBar.js'),
        }),
      );
    });

    it('loads as an NPM module if file path does not exist', () => {
      routine.context.scriptName = 'Missing';
      routine.context.eventName = 'legit-name';

      const script = routine.loadScript(routine.context);

      expect(script).toEqual(
        expect.objectContaining({
          name: 'legit-name',
          moduleName: 'beemo-script-legit-name',
        }),
      );
    });

    it('sets module path to context', () => {
      routine.context.scriptName = 'Missing';
      routine.context.eventName = 'legit-name';

      const script = routine.loadScript(routine.context);

      expect(script.name).toBe('legit-name');
      expect(routine.context).toEqual(
        expect.objectContaining({
          scriptName: 'LegitName',
          path: prependRoot('node_modules/beemo-script-legit-name/index.js'),
        }),
      );
    });

    it('errors when neither file path or module can be loaded', () => {
      routine.context.scriptName = 'Missing';
      routine.context.eventName = 'missing';

      expect(() => routine.loadScript(routine.context)).toThrowErrorMatchingSnapshot();
    });

    it('adds plugin to tool', () => {
      const script = routine.loadScript(routine.context);

      expect(routine.tool.addPlugin).toHaveBeenCalledWith('script', script);
    });

    it('triggers `load-script` event', () => {
      const spy = jest.spyOn(routine.tool, 'emit');
      const script = routine.loadScript(routine.context);

      expect(spy).toHaveBeenCalledWith('foo-bar.load-script', [routine.context, script]);
    });
  });

  describe('runScript()', () => {
    it('calls the script args() and execute()', async () => {
      class TestScript extends Script {
        args() {
          return {
            boolean: ['foo'],
            default: {
              foo: false,
            },
          };
        }
      }

      const script = new TestScript();
      script.bootstrap();

      const argsSpy = jest.spyOn(script, 'args');
      const exSpy = jest.spyOn(script, 'execute');

      await routine.runScript(routine.context, script);

      expect(argsSpy).toHaveBeenCalled();
      expect(exSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({
          _: ['bar', 'baz'],
          a: true,
          foo: true,
        }),
      );
    });

    it('add tasks to parent routine', async () => {
      class TasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
          this.task('Task', () => 456);
          this.task('Task', () => 789);
        }
      }

      const script = new TasksScript();
      script.bootstrap();

      // Not bootstrapped for this test so its 0 instead of 2
      expect(routine.tasks).toHaveLength(0);

      await routine.runScript(routine.context, script);

      expect(routine.tasks).toHaveLength(3);
    });

    it('parallelizes tasks', async () => {
      class ParallelTasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
          this.task('Task', () => 456);
          this.task('Task', () => 789);
        }

        execute() {
          return this.executeTasks('parallel');
        }
      }

      const script = new ParallelTasksScript();
      script.bootstrap();

      const spy = jest.spyOn(routine, 'parallelizeTasks');

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything(), script.tasks);
    });

    it('pools tasks', async () => {
      class PoolTasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
          this.task('Task', () => 456);
          this.task('Task', () => 789);
        }

        execute() {
          return this.executeTasks('pool');
        }
      }

      const script = new PoolTasksScript();
      script.bootstrap();

      const spy = jest.spyOn(routine, 'poolTasks');

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything(), {}, script.tasks);
    });

    it('serializes tasks', async () => {
      class SerialTasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
          this.task('Task', () => 456);
          this.task('Task', () => 789);
        }

        execute() {
          return this.executeTasks('serial');
        }
      }

      const script = new SerialTasksScript();
      script.bootstrap();

      const spy = jest.spyOn(routine, 'serializeTasks');

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything(), script.tasks);
    });

    it('synchronizes tasks', async () => {
      class SyncTasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
          this.task('Task', () => 456);
          this.task('Task', () => 789);
        }

        execute() {
          return this.executeTasks('sync');
        }
      }

      const script = new SyncTasksScript();
      script.bootstrap();

      const spy = jest.spyOn(routine, 'synchronizeTasks');

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything(), script.tasks);
    });

    it('doesnt run script tasks if `executeTasks` is not called', async () => {
      class NoTasksScript extends Script {
        bootstrap() {
          this.task('Task', () => 123);
        }

        execute() {
          return Promise.resolve();
        }
      }

      const script = new NoTasksScript();
      script.bootstrap();

      const exSpy = jest.spyOn(script, 'executeTasks');

      await routine.runScript(routine.context, script);

      expect(exSpy).not.toHaveBeenCalled();
    });

    it('triggers `before-execute` event', async () => {
      class MockScript extends Script {
        execute() {
          return Promise.resolve();
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new MockScript();
      script.bootstrap();

      routine.context.eventName = 'before';

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith('before.before-execute', [
        routine.context,
        routine.context.argv,
        script,
      ]);
    });

    it('triggers `after-execute` event on success', async () => {
      class SuccessScript extends Script {
        execute() {
          return Promise.resolve(123);
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new SuccessScript();
      script.bootstrap();

      routine.context.eventName = 'after';

      await routine.runScript(routine.context, script);

      expect(spy).toHaveBeenCalledWith('after.after-execute', [routine.context, 123, script]);
    });

    it('triggers `failed-execute` event on failure', async () => {
      class FailureScript extends Script {
        execute() {
          return Promise.reject(new Error('Oops'));
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new FailureScript();
      script.bootstrap();

      routine.context.eventName = 'fail';

      try {
        await routine.runScript(routine.context, script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('fail.failed-execute', [routine.context, error, script]);
      }
    });
  });
});
