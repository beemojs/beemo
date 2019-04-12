import fs from 'fs-extra';
import CleanupRoutine from '../src/CleanupRoutine';
import { mockTool, mockDebugger, stubDriverContext } from '../src/testUtils';

jest.mock('fs-extra');

describe('CleanupRoutine', () => {
  let routine: CleanupRoutine;

  beforeEach(() => {
    routine = new CleanupRoutine('cleanup', 'Cleaning up');
    routine.context = stubDriverContext();
    routine.tool = mockTool();
    routine.debug = mockDebugger();
    routine.bootstrap();
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
      routine.context.configPaths = [
        { driver: 'foo', path: './foo.json' },
        { driver: 'bar', path: './.barrc' },
      ];

      const result = await routine.deleteConfigFiles(routine.context);

      expect(fs.remove).toHaveBeenCalledWith('./foo.json');
      expect(fs.remove).toHaveBeenCalledWith('./.barrc');
      expect(result).toEqual([true, true]);
    });

    it('emits `onDeleteConfigFile` event', async () => {
      const spy = jest.fn();

      routine.context.primaryDriver.onDeleteConfigFile.listen(spy);

      routine.context.configPaths = [
        { driver: 'foo', path: './foo.json' },
        { driver: 'bar', path: './.barrc' },
      ];

      await routine.deleteConfigFiles(routine.context);

      expect(spy).toHaveBeenCalledWith(routine.context, './foo.json');
      expect(spy).toHaveBeenCalledWith(routine.context, './.barrc');
    });
  });
});
