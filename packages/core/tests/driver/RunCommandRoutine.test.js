import RunCommandRoutine from '../../src/driver/RunCommandRoutine';

describe('RunCommandRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new RunCommandRoutine('babel', 'Run babel');
    routine.context = {
      configPaths: [],
    };
    routine.tool = {
      debug() {},
      emit() {},
    };
  });

  it.skip('TODO', () => {});
});
