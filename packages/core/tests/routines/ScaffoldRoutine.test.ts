import * as hygen from 'hygen';
import { Path } from '@boost/common';
import ScaffoldRoutine from '../../src/routines/ScaffoldRoutine';
import { mockTool, mockDebugger, stubScaffoldContext } from '../../src/testUtils';

jest.mock('hygen');

describe('ScaffoldRoutine', () => {
  let routine: ScaffoldRoutine;

  beforeEach(() => {
    routine = new ScaffoldRoutine('scaffold', 'Scaffolding templates');
    routine.context = stubScaffoldContext();
    routine.tool = mockTool();
    routine.tool.config.module = '@beemo/local';
    routine.debug = mockDebugger();
  });

  describe('handleExec()', () => {
    it('executes command internally', () => {
      const spy = jest.spyOn(routine, 'executeCommand').mockImplementation();

      // @ts-ignore Allow access
      routine.handleExec('babel', 'const foo = {};');

      expect(spy).toHaveBeenCalledWith('babel', [], {
        input: 'const foo = {};',
        shell: true,
      });
    });
  });

  describe('handleLog()', () => {
    it('logs to tool', () => {
      const spy = jest.spyOn(routine.tool.console, 'log');

      // @ts-ignore Allow access
      routine.handleLog('foo');

      expect(spy).toHaveBeenCalledWith('foo');
    });
  });

  describe('execute()', () => {
    it('passes module name to tasks', async () => {
      jest.spyOn(routine, 'serializeTasks').mockImplementation();

      routine.bootstrap();

      await routine.execute(routine.context);

      expect(routine.serializeTasks).toHaveBeenCalledWith('@beemo/local');
    });

    it('executes pipeline in order', async () => {
      const runSpy = jest.spyOn(routine, 'runGenerator');

      routine.bootstrap();

      await routine.execute(routine.context);

      expect(runSpy).toHaveBeenCalledWith(routine.context, '@beemo/local', expect.anything());
    });
  });

  describe('runGenerator()', () => {
    it('executes hygen engine', async () => {
      await routine.runGenerator(routine.context, '@beemo/local');

      expect(hygen.engine).toHaveBeenCalledWith(['-a', '--foo', 'bar', 'baz'], {
        createPrompter: expect.anything(),
        cwd: routine.tool.options.root,
        debug: false,
        // @ts-ignore Allow access
        exec: routine.handleExec,
        logger: expect.anything(),
        templates: new Path(process.cwd(), 'packages/local/templates').path(),
      });
    });

    it('rethrows error', async () => {
      const baseError = new Error('Oops');

      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw baseError;
      });

      try {
        await routine.runGenerator(routine.context, '@beemo/local');
      } catch (error) {
        expect(error).toBe(baseError);
      }
    });

    it('rewrites error message', async () => {
      (hygen.engine as jest.Mock).mockImplementation(() => {
        throw new Error("I can't find action 'action' for generator 'generator'.");
      });

      try {
        await routine.runGenerator(routine.context, '@beemo/local');
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });
  });
});
