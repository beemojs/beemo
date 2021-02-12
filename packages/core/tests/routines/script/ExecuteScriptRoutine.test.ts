import { Path } from '@boost/common';
import ScriptContext from '../../../src/contexts/ScriptContext';
import ExecuteScriptRoutine from '../../../src/routines/script/ExecuteScriptRoutine';
import Script from '../../../src/Script';
import {
  mockDebugger,
  mockScript,
  mockTool,
  stubScriptContext,
  TestScript,
} from '../../../src/test';
import Tool from '../../../src/Tool';

describe('ExecuteScriptRoutine', () => {
  let routine: ExecuteScriptRoutine;
  let tool: Tool;
  let script: Script;
  let context: ScriptContext;

  beforeEach(() => {
    tool = mockTool();
    script = mockScript('test', tool);
    context = stubScriptContext();

    routine = new ExecuteScriptRoutine('script', 'Run script', { tool });
    // @ts-expect-error
    routine.debug = mockDebugger();
  });

  describe('execute()', () => {
    it('calls the script parse() and execute()', async () => {
      class BaseTestScript extends TestScript<{ foo: boolean }> {
        parse() {
          return {
            options: {
              foo: {
                description: '',
                type: 'boolean',
              },
            },
          } as const;
        }
      }

      script = new BaseTestScript();

      const parseSpy = jest.spyOn(script, 'parse');
      const exSpy = jest.spyOn(script, 'execute');

      await routine.execute(context, script);

      expect(parseSpy).toHaveBeenCalled();
      expect(exSpy).toHaveBeenCalledWith(
        context,
        expect.objectContaining({
          options: { foo: true },
          params: ['bar', 'baz'],
        }),
      );
    });

    it('clones the context and sets root to `packageRoot`', async () => {
      routine.configure({
        packageRoot: '/some/path',
      });

      const exSpy = jest.spyOn(script, 'execute');

      await routine.execute(context, script);

      expect(exSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: new Path('/some/path'),
        }),
        expect.anything(),
      );
    });

    it('emits `onBeforeExecute` event', async () => {
      const spy = jest.fn();

      script.onBeforeExecute.listen(spy);

      await routine.execute(context, script);

      expect(spy).toHaveBeenCalledWith(context, context.argv);
    });

    it('emits `onAfterExecute` event on success', async () => {
      class SuccessScript extends TestScript {
        execute() {
          return Promise.resolve(123);
        }
      }

      const spy = jest.fn();

      script = new SuccessScript();
      script.onAfterExecute.listen(spy);

      await routine.execute(context, script);

      expect(spy).toHaveBeenCalledWith(context, 123);
    });

    it('emits `onFailedExecute` event on failure', async () => {
      class FailureScript extends TestScript {
        execute() {
          return Promise.reject(new Error('Oops'));
        }
      }

      const spy = jest.fn();

      script = new FailureScript();
      script.onFailedExecute.listen(spy);

      try {
        await routine.execute(context, script);
      } catch (error) {
        expect(spy).toHaveBeenCalledWith(context, error);
      }
    });
  });
});
