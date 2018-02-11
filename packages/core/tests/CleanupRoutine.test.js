import fs from 'fs-extra';
import CleanupRoutine from '../src/CleanupRoutine';

jest.mock('fs-extra');

describe('CleanupRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new CleanupRoutine('cleanup', 'Cleaning up');
    routine.context = {
      configPaths: [],
    };
    routine.tool = {
      debug() {},
      emit() {},
    };
  });

  describe('deleteConfigFiles()', () => {
    beforeEach(() => {
      fs.remove.mockImplementation(() => Promise.resolve());
    });

    it('does nothing when no config paths', async () => {
      const result = await routine.deleteConfigFiles();

      expect(fs.remove).not.toHaveBeenCalled();
    });

    it('calls remove for each config path', async () => {
      routine.context.configPaths = [
        './foo.json',
        './.barrc',
      ];

      const result = await routine.deleteConfigFiles();

      expect(fs.remove).toHaveBeenCalledWith('./foo.json');
      expect(fs.remove).toHaveBeenCalledWith('./.barrc');
      expect(result).toEqual([true, true]);
    });
  });
});
