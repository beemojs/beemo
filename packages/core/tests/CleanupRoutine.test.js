import { Tool } from 'boost';
import fs from 'fs-extra';
import CleanupRoutine from '../src/CleanupRoutine';
import { createDriverContext, setupMockTool } from '../../../tests/helpers';

jest.mock('fs-extra');
jest.mock('boost/lib/Tool');

describe('CleanupRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new CleanupRoutine('cleanup', 'Cleaning up');
    routine.context = createDriverContext();
    routine.tool = setupMockTool(new Tool());
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
      fs.remove.mockImplementation(() => Promise.resolve());
    });

    it('does nothing when no config paths', async () => {
      await routine.deleteConfigFiles();

      expect(fs.remove).not.toHaveBeenCalled();
    });

    it('calls remove for each config path', async () => {
      routine.context.configPaths = ['./foo.json', './.barrc'];

      const result = await routine.deleteConfigFiles();

      expect(fs.remove).toHaveBeenCalledWith('./foo.json');
      expect(fs.remove).toHaveBeenCalledWith('./.barrc');
      expect(result).toEqual([true, true]);
    });

    it('triggers `delete-config-file` event', async () => {
      const spy = routine.tool.emit;

      routine.context.configPaths = ['./foo.json', './.barrc'];

      await routine.deleteConfigFiles();

      expect(spy).toHaveBeenCalledWith('delete-config-file', ['./foo.json']);
      expect(spy).toHaveBeenCalledWith('delete-config-file', ['./.barrc']);
    });
  });
});
