import fs from 'fs-extra';
import CleanupConfigsRoutine from '../../src/routines/CleanupConfigsRoutine';
import { mockTool, mockDebugger, mockDriver, stubDriverContext } from '../../src/testUtils';

describe('CleanupConfigsRoutine', () => {
  let routine: CleanupConfigsRoutine;

  beforeEach(() => {
    const tool = mockTool();
    const driver = mockDriver('test-driver', tool);

    routine = new CleanupConfigsRoutine('cleanup', 'Cleaning up');
    routine.context = stubDriverContext(driver);
    routine.tool = tool;
    routine.debug = mockDebugger();
    routine.bootstrap();

    routine.tool.addPlugin('driver', driver);
    routine.tool.addPlugin('driver', mockDriver('other-driver', tool));
  });

  describe('deleteConfigFiles()', () => {
    let removeSpy: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      removeSpy = jest.spyOn(fs, 'remove').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      removeSpy.mockRestore();
    });

    it('does nothing when no config paths', async () => {
      await routine.deleteConfigFiles(routine.context);

      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('calls remove for each config path', async () => {
      routine.context.configPaths = [
        { driver: 'test-driver', path: './foo.json' },
        { driver: 'other-driver', path: './.barrc' },
      ];

      const result = await routine.deleteConfigFiles(routine.context);

      expect(removeSpy).toHaveBeenCalledWith('./foo.json');
      expect(removeSpy).toHaveBeenCalledWith('./.barrc');
      expect(result).toEqual([true, true]);
    });

    it('emits `onDeleteConfigFile` event', async () => {
      const spy = jest.fn();

      routine.context.primaryDriver.onDeleteConfigFile.listen(spy);

      routine.context.configPaths = [
        { driver: 'test-driver', path: './foo.json' },
        { driver: 'other-driver', path: './.barrc' },
      ];

      await routine.deleteConfigFiles(routine.context);

      expect(spy).toHaveBeenCalledWith(routine.context, './foo.json');
      expect(spy).not.toHaveBeenCalledWith(routine.context, './.barrc');
    });
  });
});
