import path from 'path';
import ExecuteDriverRoutine from '../src/ExecuteDriverRoutine';
import RunCommandRoutine from '../src/execute/RunCommandRoutine';
import Driver from '../src/Driver';
import {
  createDriverContext,
  createTestDebugger,
  createTestDriver,
  createTestTool,
  getFixturePath,
} from '../../../tests/helpers';

describe('ExecuteDriverRoutine', () => {
  let routine: ExecuteDriverRoutine;
  let driver: Driver;

  function createTestRunCommand(title: string, command: string, options: any = {}) {
    const run = new RunCommandRoutine(title, command, options);

    run.action = expect.anything();
    run.captureLiveOutput = expect.anything();

    return run;
  }

  beforeEach(() => {
    const tool = createTestTool();

    driver = createTestDriver('primary', tool);

    routine = new ExecuteDriverRoutine('driver', 'Executing driver');
    routine.context = createDriverContext(driver);
    routine.tool = tool;
    routine.debug = createTestDebugger();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the primary driver', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        createTestRunCommand('primary', 'primary -a --foo bar baz'),
      );
    });

    it('adds multiple routines when parallel is used', () => {
      routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        createTestRunCommand('primary', 'primary -a --foo bar baz --one --two=2', {
          additionalArgv: ['--one', '--two=2'],
        }),
      );
      expect(routine.pipe).toHaveBeenCalledWith(
        createTestRunCommand('primary', 'primary -a --foo bar baz --three -f', {
          additionalArgv: ['--three', '-f'],
        }),
      );
    });

    it('adds a routine if parallel is empty', () => {
      routine.context.parallelArgv = [];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        createTestRunCommand('primary', 'primary -a --foo bar baz'),
      );
    });

    describe('workspaces', () => {
      const fixturePath = getFixturePath('workspaces-driver');

      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.workspaceRoot = fixturePath;
        routine.context.cwd = fixturePath;
      });

      it('adds a routine for each', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(3);
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('foo', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('bar', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('baz', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          }),
        );
      });

      it('adds a routine for each when parallel is used', () => {
        routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(9);
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('foo', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('foo', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/foo'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('bar', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('bar', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/bar'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('baz', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunCommand('baz', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: path.join(fixturePath, './packages/baz'),
          }),
        );
      });

      it('errors if workspaces config is not set', () => {
        expect(() => {
          delete routine.context.workspaces;
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });

      it('errors if workspaces config is empty', () => {
        expect(() => {
          routine.context.workspaces = [];
          routine.bootstrap();
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
