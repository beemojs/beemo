import ModuleLoader from 'boost/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import Script from '../src/Script';

jest.mock('boost/lib/ModuleLoader', () => jest.fn(() => ({
  importModule: jest.fn(() => ({})),
})));

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
  });
});
