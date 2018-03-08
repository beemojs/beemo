import RunCommandRoutine from '../../src/driver/RunCommandRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import JestDriver from '../../../driver-jest/src/JestDriver';

describe('RunCommandRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new RunCommandRoutine('babel', 'Run babel');
    routine.context = {
      configPaths: [],
      primaryDriver: {}, // TODO
    };
    routine.tool = {
      debug() {},
      emit() {},
      on() {},
    };
  });

  describe('extractNativeOptions()', () => {
    it('extracts all types of options', async () => {
      const driver = new BabelDriver();
      driver.tool = routine.tool;
      driver.bootstrap();

      routine.context.primaryDriver = driver;

      const options = await routine.extractNativeOptions();

      expect(options).toEqual(expect.objectContaining({
        '-f': true, // Short
        '-M': true, // Uppercase short
        '--filename': true, // Long
        '--no-highlight-code': true, // With dashes
      }));
    });

    it('supports uppercased options', async () => {
      const driver = new JestDriver();
      driver.tool = routine.tool;
      driver.bootstrap();

      routine.context.primaryDriver = driver;

      const options = await routine.extractNativeOptions();

      expect(options).toEqual(expect.objectContaining({
        '-c': true, // Short
        '--all': true, // Long
        '--changedFilesWithAncestor': true, // Camel case
      }));
    });
  });
});
