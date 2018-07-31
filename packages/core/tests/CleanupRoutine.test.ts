import { Tool } from 'boost';
import fs from 'fs-extra';
import CleanupRoutine from '../src/CleanupRoutine';
import { createDriverContext, setupMockTool, createTestDebugger } from '../../../tests/helpers';

jest.mock('fs-extra');
jest.mock('boost/lib/Tool');

describe('CleanupRoutine', () => {
  let routine: CleanupRoutine;

  beforeEach(() => {
    routine = new CleanupRoutine('cleanup', 'Cleaning up');
    routine.context = createDriverContext();
    routine.tool = setupMockTool(new Tool({}));
    routine.debug = createTestDebugger();
  });

  describe('execute()', () => {
    it('doesnt call `deleteConfigFiles` if `cleanup` is false', () => {
      routine.tool.config.config.cleanup = true;

      routine.deleteConfigFiles = jest.fn();
      routine.execute();

      expect(routine.deleteConfigFiles).not.toHaveBeenCalled();
    });
  });

  describe('deleteConfigFiles()', () => {
    beforeEach(() => {
      (fs.remove as jest.Mock).mockImplementation(() => Promise.resolve());
    });

    it('does nothing when no config paths', async () => {
      await routine.deleteConfigFiles(routine.context);

      expect(fs.remove).not.toHaveBeenCalled();
    });

    it('calls remove for each config path', async () => {
      routine.context.configPaths = ['./foo.json', './.barrc'];

      const result = await routine.deleteConfigFiles(routine.context);

      expect(fs.remove).toHaveBeenCalledWith('./foo.json');
      expect(fs.remove).toHaveBeenCalledWith('./.barrc');
      expect(result).toEqual([true, true]);
    });

    it('triggers `delete-config-file` event', async () => {
      routine.context.configPaths = ['./foo.json', './.barrc'];

      await routine.deleteConfigFiles(routine.context);

      expect(routine.tool.emit).toHaveBeenCalledWith('delete-config-file', ['./foo.json']);
      expect(routine.tool.emit).toHaveBeenCalledWith('delete-config-file', ['./.barrc']);
    });
  });
});
