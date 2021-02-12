import * as hygen from 'hygen';
import { Path } from '@boost/common';
import ScaffoldContext from '../../src/contexts/ScaffoldContext';
import ScaffoldRoutine from '../../src/routines/ScaffoldRoutine';
import { mockConsole, mockDebugger, mockTool, stubScaffoldContext } from '../../src/test';
import Tool from '../../src/Tool';

jest.mock('hygen');

describe('ScaffoldRoutine', () => {
  let tool: Tool;
  let context: ScaffoldContext;
  let routine: ScaffoldRoutine;

  beforeEach(() => {
    tool = mockTool();
    tool.config.module = '@beemo/local';
    context = stubScaffoldContext();

    routine = new ScaffoldRoutine('scaffold', 'Scaffolding templates', { tool });
    // @ts-expect-error
    routine.debug = mockDebugger();
  });

  describe('handleExec()', () => {
    it('executes command internally', () => {
      const spy = jest.spyOn(routine, 'executeCommand').mockImplementation();

      // @ts-expect-error
      routine.handleExec('babel', 'const foo = {};');

      expect(spy).toHaveBeenCalledWith('babel', [], {
        input: 'const foo = {};',
        shell: true,
      });
    });
  });

  describe('handleLog()', () => {
    it('logs to console', () => {
      const spy = mockConsole('log');

      // @ts-expect-error
      routine.handleLog('foo');

      expect(spy).toHaveBeenCalledWith('foo');

      spy.mockRestore();
    });
  });

  describe('execute()', () => {
    it('executes pipeline in order', async () => {
      const runSpy = jest.spyOn(routine, 'runGenerator');

      await routine.execute(context);

      expect(runSpy).toHaveBeenCalledWith(context, undefined, expect.anything());
    });
  });

  describe('runGenerator()', () => {
    it('executes hygen engine', async () => {
      await routine.runGenerator(context);

      expect(hygen.engine).toHaveBeenCalledWith(
        ['-a', '--foo', 'bar', 'baz'],
        expect.objectContaining({
          cwd: tool.cwd.path(),
          debug: false,
          templates: new Path(process.cwd(), 'packages/local/templates').path(),
        }),
      );
    });

    it('rethrows error', async () => {
      const baseError = new Error('Oops');

      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw baseError;
      });

      try {
        await routine.runGenerator(context);
      } catch (error) {
        expect(error).toBe(baseError);
      }
    });

    it('rewrites error message', async () => {
      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw new Error("I can't find action 'action' for generator 'generator'.");
      });

      try {
        await routine.runGenerator(context);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});
