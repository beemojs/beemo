import Driver from '../src/Driver';
import ExecuteDriverRoutine from '../src/ExecuteDriverRoutine';
import RunCommandRoutine from '../src/execute/RunCommandRoutine';
import DriverContext from '../src/contexts/DriverContext';
import {
  getFixturePath,
  createDriverContext,
  createTestDebugger,
  createTestDriver,
  createTestTool,
} from '../../../tests/helpers';

jest.mock('../src/execute/RunCommandRoutine', () => jest.fn());

describe('ExecuteDriverRoutine', () => {
  let routine: ExecuteDriverRoutine;
  let driver: Driver;

  beforeEach(() => {
    const tool = createTestTool();

    driver = createTestDriver('primary', tool);

    routine = new ExecuteDriverRoutine('driver', 'Executing driver');
    routine.context = createDriverContext(driver);
    routine.tool = tool;
    routine.debug = createTestDebugger();

    // RunCommandRoutine is mocked, so use plain objects
    routine.routines = [
      // @ts-ignore
      { key: 'primary' },
      // @ts-ignore
      { key: 'foo' },
      // @ts-ignore
      { key: 'bar' },
      // @ts-ignore
      { key: 'baz' },
      // @ts-ignore
      { key: 'qux' },
    ];

    routine.workspacePackages = [
      {
        name: '@scope/primary',
        version: '0.0.0',
        workspace: tool.createWorkspaceMetadata('./packages/primary/package.json'),
      },
      {
        name: '@scope/foo',
        version: '0.0.0',
        workspace: tool.createWorkspaceMetadata('./packages/foo/package.json'),
      },
      {
        name: '@scope/bar',
        version: '0.0.0',
        workspace: tool.createWorkspaceMetadata('./packages/bar/package.json'),
      },
      {
        name: '@scope/baz',
        version: '0.0.0',
        workspace: tool.createWorkspaceMetadata('./packages/baz/package.json'),
      },
      {
        name: '@scope/qux',
        version: '0.0.0',
        workspace: tool.createWorkspaceMetadata('./packages/qux/package.json'),
      },
    ];

    // @ts-ignore
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

    it('adds multiple routines when parallel is used', () => {
      routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
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
      routine.context.parallelArgv = [];
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
        routine.context.workspaceRoot = getFixturePath('workspaces-driver');
        routine.context.root = getFixturePath('workspaces-driver');
      });

      it('adds a routine for each', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(3);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz', {
            forceConfigOption: true,
            packageRoot: './packages/baz',
          }),
        );
      });

      it('adds a routine for each when parallel is used', () => {
        routine.context.parallelArgv = [['--one', '--two=2'], ['--three', '-f']];
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(9);
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('foo', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: './packages/foo',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('bar', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: './packages/bar',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --one --two=2', {
            additionalArgv: ['--one', '--two=2'],
            forceConfigOption: true,
            packageRoot: './packages/baz',
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          new RunCommandRoutine('baz', 'primary -a --foo bar baz --three -f', {
            additionalArgv: ['--three', '-f'],
            forceConfigOption: true,
            packageRoot: './packages/baz',
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

  describe('execute()', () => {
    let context: DriverContext;

    beforeEach(() => {
      context = createDriverContext(driver);
    });

    it('pools each routine', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));

      await routine.execute(context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, routine.routines);
    });

    it('passes concurrency to pooler', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      context.args.concurrency = 2;

      await routine.execute(context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, { concurrency: 2 }, routine.routines);
    });

    it('passes concurrency option to pooler', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      routine.tool.config.execute.concurrency = 3;

      await routine.execute(context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(null, { concurrency: 3 }, routine.routines);
    });

    it('throws an error if any failures', async () => {
      routine.poolRoutines = jest.fn(() =>
        Promise.resolve({ errors: [new Error('Failed'), new Error('Oops')], results: [] }),
      );

      try {
        await routine.execute(context);
      } catch (error) {
        expect(error).toEqual(
          new Error(
            'Failed to execute driver pipeline. The following errors have occurred:\n\nFailed\n\nOops',
          ),
        );
      }
    });

    it('returns results', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [123] }));

      const response = await routine.execute(context);

      expect(response).toEqual([123]);
    });

    it('serializes priority routines before pooling other routines', async () => {
      routine.context.args.priority = true;
      routine.context.args.workspaces = '*';
      routine.serializeRoutines = jest.fn(() => Promise.resolve());
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      routine.workspacePackages[1].peerDependencies = {
        '@scope/foo': '1.0.0',
      };

      await routine.execute(context);

      expect(routine.serializeRoutines).toHaveBeenCalledWith(null, [{ key: 'foo' }]);
      expect(routine.poolRoutines).toHaveBeenCalledWith(null, {}, [
        { key: 'primary' },
        { key: 'bar' },
        { key: 'baz' },
        { key: 'qux' },
      ]);
    });
  });

  describe('getFilteredWorkspaces()', () => {
    it('returns none for empty string', () => {
      routine.context.args.workspaces = '';

      expect(routine.getFilteredWorkspacePackages()).toEqual([]);
    });

    it('returns all for wildcard `*`', () => {
      routine.context.args.workspaces = '*';

      expect(routine.getFilteredWorkspacePackages()).toEqual([
        {
          name: '@scope/primary',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/primary/package.json'),
        },
        {
          name: '@scope/foo',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/foo/package.json'),
        },
        {
          name: '@scope/bar',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/bar/package.json'),
        },
        {
          name: '@scope/baz',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/baz/package.json'),
        },
        {
          name: '@scope/qux',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/qux/package.json'),
        },
      ]);
    });

    it('filters by package name', () => {
      routine.context.args.workspaces = 'foo|bar';

      expect(routine.getFilteredWorkspacePackages()).toEqual([
        {
          name: '@scope/foo',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/foo/package.json'),
        },
        {
          name: '@scope/bar',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/bar/package.json'),
        },
      ]);
    });
  });

  describe('orderByWorkspacePriorityGraph()', () => {
    beforeEach(() => {
      routine.context.args.priority = true;
      routine.context.args.workspaces = '*';
    });

    it('returns all as `other` if priority is false', () => {
      routine.context.args.priority = false;
      routine.tool.config.execute.priority = false;

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it('returns all as `other` if workspaces is empty', () => {
      routine.context.args.workspaces = '';

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it('returns all as `other` if no dependents', () => {
      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'bar' }, { key: 'baz' }, { key: 'qux' }],
        priority: [],
      });
    });

    it.only('prioritizes based on peerDependencies', () => {
      routine.workspacePackages[1].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }],
      });
    });

    it('prioritizes based on dependencies', () => {
      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'primary' }, { key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }],
      });
    });

    it('sorts priority based on dependency count', () => {
      routine.workspacePackages[2].peerDependencies = {
        '@scope/primary': '2.0.0',
      };

      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      routine.workspacePackages[4].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'foo' }, { key: 'baz' }, { key: 'qux' }],
        priority: [{ key: 'bar' }, { key: 'primary' }],
      });
    });

    it('sorts priority by taking `priority` package option into account', () => {
      routine.workspacePackages[0].priority = 100;

      routine.workspacePackages[2].peerDependencies = {
        '@scope/primary': '2.0.0',
      };

      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      routine.workspacePackages[4].priority = 3;
      routine.workspacePackages[4].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual({
        other: [{ key: 'foo' }, { key: 'baz' }],
        priority: [{ key: 'primary' }, { key: 'qux' }, { key: 'bar' }],
      });
    });
  });
});
