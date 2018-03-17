import { Tool } from 'boost';
import ModuleLoader from 'boost/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import Script from '../src/Script';
import { createScriptContext, setupMockTool, prependRoot } from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

jest.mock('boost/lib/ModuleLoader', () =>
  jest.fn(() => ({
    importModule: jest.fn(() => ({
      parse: () => ({}),
      run: () => Promise.resolve(123),
    })),
  })),
);

describe('ExecuteScriptRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new ExecuteScriptRoutine('script', 'Executing script');
    routine.context = createScriptContext();
    routine.tool = setupMockTool(new Tool());

    ModuleLoader.mockClear();
  });

  describe('execute()', () => {
    it('passes script name to tasks', () => {
      routine.serializeTasks = jest.fn();
      routine.execute('foo');

      expect(routine.serializeTasks).toHaveBeenCalledWith('foo');
    });

    it('executes pipeline in order', async () => {
      const loadSpy = jest.spyOn(routine, 'loadScript');
      const runSpy = jest.spyOn(routine, 'runScript');

      const response = await routine.execute('foo-bar');

      expect(loadSpy).toHaveBeenCalledWith('foo-bar', routine.context);
      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'foo-bar',
        }),
        routine.context,
      );
      expect(response).toBe(123);
    });
  });

  describe('loadScript()', () => {
    it('loads the script using ModuleLoader', async () => {
      await routine.loadScript('foo-bar');

      expect(ModuleLoader).toHaveBeenCalledWith(routine.tool, 'script', Script);
    });

    it('sets values to context', async () => {
      const script = await routine.loadScript('foo-bar');

      expect(script.name).toBe('foo-bar');
      expect(routine.context).toEqual(
        expect.objectContaining({
          scriptName: 'foo-bar',
          scriptPath: prependRoot('scripts/foo-bar.js'),
        }),
      );
    });

    it('triggers `load-script` event', async () => {
      const spy = routine.tool.emit;

      const script = await routine.loadScript('foo-bar');

      expect(spy).toHaveBeenCalledWith('load-script', [script]);
    });
  });

  describe('runScript()', () => {
    it('calls the scripts parse() and run()', () => {
      const script = {
        parse: jest.fn(() => ({
          boolean: ['foo'],
        })),
        run: jest.fn(),
      };

      routine.runScript(script);

      expect(script.parse).toHaveBeenCalledWith();
      expect(script.run).toHaveBeenCalledWith(
        {
          _: ['bar', 'baz'],
          a: true,
          foo: true,
        },
        routine.tool,
      );
    });

    it('triggers `before-execute` event', async () => {
      class MockScript extends Script {
        run() {}
      }

      const spy = routine.tool.emit;
      const script = new MockScript();

      await routine.runScript(script);

      expect(spy).toHaveBeenCalledWith('before-execute', [
        script,
        routine.context.args,
        routine.context.yargs,
      ]);
    });

    it('triggers `after-execute` event on success', async () => {
      class SuccessScript extends Script {
        run() {
          return Promise.resolve(123);
        }
      }

      const spy = routine.tool.emit;
      const script = new SuccessScript();

      await routine.runScript(script);

      expect(spy).toHaveBeenCalledWith('after-execute', [script, 123]);
    });

    it('triggers `failed-execute` event on failure', async () => {
      class FailureScript extends Script {
        run() {
          return Promise.reject(new Error('Oops'));
        }
      }

      const spy = routine.tool.emit;
      const script = new FailureScript();

      try {
        await routine.runScript(script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('failed-execute', [script, error]);
      }
    });
  });
});
