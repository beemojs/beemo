import { Tool } from '@boost/core';
import Script from '../../src/Script';
import RunScriptRoutine from '../../src/execute/RunScriptRoutine';
import { createTestDebugger, createTestTool, createScriptContext } from '../../../../tests/helpers';

describe('RunScriptRoutine', () => {
  let routine: RunScriptRoutine;
  let tool: Tool<any, any>;

  beforeEach(() => {
    tool = createTestTool();

    routine = new RunScriptRoutine('script', 'Run script');
    routine.tool = tool;
    routine.context = createScriptContext(new Script());
    routine.debug = createTestDebugger();
    routine.bootstrap();
  });

  describe('execute()', () => {
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

      await routine.execute(routine.context, script);

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

    it('clones the context and sets root to `packageRoot`', async () => {
      routine.options.packageRoot = '/some/path';

      const script = new Script();
      const exSpy = jest.spyOn(script, 'execute');

      await routine.execute(routine.context, script);

      expect(exSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          root: '/some/path',
        }),
        expect.anything(),
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

      await routine.execute(routine.context, script);

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

      await routine.execute(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything());
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

      await routine.execute(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything());
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

      await routine.execute(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything());
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

      await routine.execute(routine.context, script);

      expect(spy).toHaveBeenCalledWith(expect.anything());
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

      await routine.execute(routine.context, script);

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

      await routine.execute(routine.context, script);

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

      await routine.execute(routine.context, script);

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
        await routine.execute(routine.context, script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('fail.failed-execute', [routine.context, error, script]);
      }
    });
  });

  describe('runScriptTasks()', () => {
    it('rebinds the task to the script', () => {
      class TaskScript extends Script {
        bootstrap() {
          this.task('Test', this.boundTask);
        }

        boundTask() {
          // eslint-disable-next-line
          expect(this).toBe(script);

          return this.otherMethod();
        }

        otherMethod() {
          // eslint-disable-next-line
          expect(this).toBe(script);

          return true;
        }
      }

      const script = new TaskScript();
      script.bootstrap();

      routine.context.script = script;

      routine.runScriptTasks({} as any, 'pool', script.tasks);
    });
  });
});
