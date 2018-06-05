import path from 'path';
import { Tool } from 'boost';
import ModuleLoader from 'boost/lib/ModuleLoader';
import ExecuteDriverRoutine from '../src/ExecuteDriverRoutine';
import RunCommandRoutine from '../src/driver/RunCommandRoutine';
import {
  createDriver,
  createDriverContext,
  setupMockTool,
  prependRoot,
} from '../../../tests/helpers';

jest.mock('boost/lib/Tool');

jest.mock('../src/driver/RunCommandRoutine', () => jest.fn());

describe('ExecuteDriverRoutine', () => {
  let routine;
  let driver;

  beforeEach(() => {
    const tool = new Tool();

    driver = createDriver('primary', tool);

    routine = new ExecuteDriverRoutine('driver', 'Executing driver');
    routine.context = createDriverContext(driver);
    routine.tool = setupMockTool(tool);
    routine.debug = jest.fn();

    RunCommandRoutine.mockClear();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the primary driver', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz'),
      );
    });

    it('adds multiple routines when --parallel is used', () => {
      routine.context.args.parallel = ['"--one --two=2"', '" --three -f "'];
      routine.context.argv.push('--parallel="--one --two=2"', '--parallel=" --three -f "');
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz --one --two=2', {
          additionalArgv: ['--one', '--two=2'],
        }),
      );
      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz --three -f', {
          additionalArgv: ['--three', '-f'],
        }),
      );
    });

    it('adds a routine if parallel is empty', () => {
      routine.context.args.parallel = [];
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(
        new RunCommandRoutine('primary', 'primary -a --foo bar baz'),
      );
    });

    describe('workspaces', () => {
      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.getWorkspaceFilteredPaths = () => [
          './packages/foo',
          './packages/bar',
          './packages/baz',
        ];
      });

      it('adds a routine for each', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(3);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
      });

      it('adds a routine for each when --parallel is used', () => {
        routine.context.args.parallel = ['"--one --two=2"', '" --three -f "'];
        routine.context.argv.push('--parallel="--one --two=2"', '--parallel=" --three -f "');
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(6);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            workspaceRoot: './packages/baz',
          }),
        );
      });

      it('errors if workspaces config is not set', () => {
        expect(() => {
          routine.context.workspaces = null;
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

  describe('execute()', () => {
    beforeEach(() => {
      // RunCommandRoutine is mocked, so use plain objects
      routine.routines = [
        { key: 'primary' },
        { key: 'foo' },
        { key: 'bar' },
        { key: 'baz' },
        { key: 'qux' },
      ];
    });

    it('pools each routine', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));

      const response = await routine.execute();

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, routine.routines);
    });

    it('throws an error if any failures', async () => {
      routine.poolRoutines = jest.fn(() =>
        Promise.resolve({ errors: [new Error('Failed'), new Error('Oops')], results: [] }),
      );

      try {
        await routine.execute();
      } catch (error) {
        expect(error).toEqual(new Error('Execution failure.\nFailed\n\nOops'));
      }
    });

    it('returns results', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [123] }));

      const response = await routine.execute();

      expect(response).toEqual([123]);
    });

    it('serializes high-priority routines before pooling routines', async () => {
      routine.context.args.priority = 'qux,foo';
      routine.serializeRoutines = jest.fn(() => Promise.resolve());
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));

      const response = await routine.execute();

      expect(routine.serializeRoutines).toHaveBeenCalledWith(null, [
        { key: 'qux' },
        { key: 'foo' },
      ]);
      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, [
        { key: 'primary' },
        { key: 'bar' },
        { key: 'baz' },
      ]);
    });
  });

  describe('getWorkspaceFilteredPaths()', () => {
    it('returns a list of paths', () => {
      routine.context.args.workspaces = '*';
      routine.context.workspaces = ['packages/*'];
      routine.context.root = process.cwd();

      expect(routine.getWorkspaceFilteredPaths()).toEqual(
        expect.arrayContaining([
          path.join(process.cwd(), 'packages/cli'),
          path.join(process.cwd(), 'packages/core'),
          path.join(process.cwd(), 'packages/driver-babel'),
          path.join(process.cwd(), 'packages/driver-typescript'),
        ]),
      );
    });

    it('returns empty if nothing found', () => {
      routine.context.args.workspaces = '*';
      routine.context.workspaces = ['packages/*'];
      routine.context.root = path.join(process.cwd(), '/some/fake/path');

      expect(routine.getWorkspaceFilteredPaths()).toEqual([]);
    });

    it('filters list using --workspaces arg', () => {
      routine.context.args.workspaces = 'driver-*';
      routine.context.workspaces = ['packages/*'];
      routine.context.root = process.cwd();

      expect(routine.getWorkspaceFilteredPaths()).toEqual(
        expect.arrayContaining([
          path.join(process.cwd(), 'packages/driver-babel'),
          path.join(process.cwd(), 'packages/driver-typescript'),
        ]),
      );
    });
  });

  describe('groupRoutinesByPriority()', () => {
    beforeEach(() => {
      // RunCommandRoutine is mocked, so use plain objects
      routine.routines = [
        { key: 'primary' },
        { key: 'foo' },
        { key: 'bar' },
        { key: 'baz' },
        { key: 'qux' },
      ];
    });

    it('returns all routines if no priority', () => {
      expect(routine.groupRoutinesByPriority()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it('extracts priority in order defined', () => {
      routine.context.args.priority = 'qux,foo';

      expect(routine.groupRoutinesByPriority()).toEqual({
        other: [{ key: 'primary' }, { key: 'bar' }, { key: 'baz' }],
        priority: [{ key: 'qux' }, { key: 'foo' }],
      });
    });
  });
});
