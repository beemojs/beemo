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
    importModule: jest.fn(path => ({
      name: 'foo-bar',
      args: jest.fn(() => ({})),
      boostrap: jest.fn(),
      execute: () => Promise.resolve(123),
    })),
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
    it('loads the script using ModuleLoader', async () => {
      await routine.loadScript(routine.context);

      expect(ModuleLoader).toHaveBeenCalledWith(routine.tool, 'script', Script);
    });

    it('sets values to context', async () => {
      const script = await routine.loadScript(routine.context);

      expect(script.name).toBe('foo-bar');
      expect(routine.context).toEqual(
        expect.objectContaining({
          scriptName: 'FooBar',
          path: prependRoot('scripts/FooBar.js'),
        }),
      );
    });

    it('adds plugin to tool', async () => {
      const script = await routine.loadScript(routine.context);

      expect(routine.tool.addPlugin).toHaveBeenCalledWith('script', script);
    });

    it('triggers `load-script` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      const script = await routine.loadScript(routine.context);

      expect(spy).toHaveBeenCalledWith('foo-bar.load-script', [routine.context, script]);
    });
  });

  describe('runScript()', () => {
    it('calls the script args() and execute()', async () => {
      const script = new Script();
      script.args = jest.fn(() => ({
        boolean: ['foo'],
        default: {
          foo: false,
        },
      }));
      script.execute = jest.fn();

      await routine.runScript(routine.context, script);

      expect(script.args).toHaveBeenCalled();
      expect(script.execute).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({
          _: ['bar', 'baz'],
          a: true,
          foo: true,
        }),
      );
    });

    it('triggers `before-execute` event', async () => {
      class MockScript extends Script {
        execute() {
          return Promise.resolve();
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new MockScript();

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

      routine.context.eventName = 'fail';

      try {
        await routine.runScript(routine.context, script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('fail.failed-execute', [routine.context, error, script]);
      }
    });
  });
});
