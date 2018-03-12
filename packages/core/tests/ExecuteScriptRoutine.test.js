import ModuleLoader from 'boost/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import Script from '../src/Script';

jest.mock('boost/lib/ModuleLoader', () =>
  jest.fn(() => ({
    importModule: jest.fn(() => ({})),
  })),
);

describe('ExecuteScriptRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new ExecuteScriptRoutine('script', 'Executing script');
    routine.context = {
      args: ['--foo'],
      moduleRoot: './root',
      script: null,
      scriptName: '',
      scriptPath: '',
      yargs: { foo: true },
    };
    routine.tool = {
      debug() {},
      emit() {},
    };
  });

  describe('execute()', () => {
    it('passes script name to tasks', () => {
      routine.serializeTasks = jest.fn();
      routine.execute('foo');

      expect(routine.serializeTasks).toHaveBeenCalledWith('foo');
    });
  });

  describe('loadScript()', () => {
    beforeEach(() => {
      ModuleLoader.mockClear();
    });

    it('loads the script using ModuleLoader', async () => {
      await routine.loadScript('foo-bar');

      expect(ModuleLoader).toHaveBeenCalledWith(routine.tool, 'script', Script);
    });

    it('sets values to context', async () => {
      const script = await routine.loadScript('foo-bar');

      expect(script.name).toBe('foo-bar');
      expect(routine.context).toEqual({
        args: ['--foo'],
        moduleRoot: './root',
        script,
        scriptName: 'foo-bar',
        scriptPath: 'root/scripts/foo-bar.js',
        yargs: { foo: true },
      });
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
      expect(script.run).toHaveBeenCalledWith({ foo: true, _: [] }, routine.tool);
    });

    it('triggers `execute-script` event', async () => {
      class MockScript extends Script {
        run() {}
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new MockScript();

      await routine.runScript(script);

      expect(spy).toHaveBeenCalledWith('execute-script', [
        script,
        routine.context.args,
        routine.context.yargs,
      ]);
    });

    it('triggers `successful-script` event on success', async () => {
      class SuccessScript extends Script {
        run() {
          return Promise.resolve(123);
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new SuccessScript();

      await routine.runScript(script);

      expect(spy).toHaveBeenCalledWith('successful-script', [script, 123]);
    });

    it('triggers `failed-script` event on failure', async () => {
      class FailureScript extends Script {
        run() {
          return Promise.reject(new Error('Oops'));
        }
      }

      const spy = jest.spyOn(routine.tool, 'emit');
      const script = new FailureScript();

      try {
        await routine.runScript(script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith('failed-script', [script, error]);
      }
    });
  });
});
