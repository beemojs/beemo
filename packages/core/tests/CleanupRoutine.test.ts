import fs from 'fs-extra';
import CleanupRoutine from '../src/CleanupRoutine';
import { createDriverContext, createTestDebugger, createTestTool } from '../../../tests/helpers';

jest.mock('fs-extra');

describe('CleanupRoutine', () => {
  let routine: CleanupRoutine;

  beforeEach(() => {
    routine = new CleanupRoutine('cleanup', 'Cleaning up');
    routine.context = createDriverContext();
    routine.tool = createTestTool();
    routine.debug = createTestDebugger();
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

    it('triggers `delete-config-file` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      routine.context.configPaths = [
        { driver: 'foo', path: './foo.json' },
        { driver: 'bar', path: './.barrc' },
      ];

      await routine.deleteConfigFiles(routine.context);

      expect(spy).toHaveBeenCalledWith('foo.delete-config-file', [routine.context, './foo.json']);
      expect(spy).toHaveBeenCalledWith('bar.delete-config-file', [routine.context, './.barrc']);
    });
  });
});
