import { Routine } from '@boost/core';
import Driver from '../../src/Driver';
import BaseExecuteRoutine from '../../src/execute/BaseRoutine';
import { mockTool, mockDriver, stubDriverContext, mockDebugger } from '../../src/testUtils';

class PipedRoutine extends Routine<any, any> {
  execute() {
    return Promise.resolve(this.key);
  }
}

class ExecuteRoutine extends BaseExecuteRoutine<any> {
  pipeRoutine(packageName?: string, packageRoot?: string) {
    this.pipe(new PipedRoutine(packageName || 'root', packageRoot || ''));
  }
}

describe('BaseExecuteRoutine', () => {
  let routine: BaseExecuteRoutine<any>;
  let driver: Driver;
  let primary: PipedRoutine;
  let foo: PipedRoutine;
  let bar: PipedRoutine;
  let baz: PipedRoutine;
  let qux: PipedRoutine;

  beforeEach(() => {
    const tool = mockTool();

    driver = mockDriver('primary', tool);

    routine = new ExecuteRoutine('driver', 'Executing driver');
    routine.context = stubDriverContext(driver);
    routine.tool = tool;
    routine.debug = mockDebugger();

    // Setup packages
    primary = new PipedRoutine('primary', 'primary');
    foo = new PipedRoutine('foo', 'foo');
    bar = new PipedRoutine('bar', 'bar');
    baz = new PipedRoutine('baz', 'baz');
    qux = new PipedRoutine('qux', 'qux');

    routine.pipe(primary);
    routine.pipe(foo);
    routine.pipe(bar);
    routine.pipe(baz);
    routine.pipe(qux);

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
  });

  describe('execute()', () => {
    it('pools each routine', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));

      await routine.execute(routine.context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(undefined, {}, routine.routines);
    });

    it('passes concurrency to pooler', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      routine.context.args.concurrency = 2;

      await routine.execute(routine.context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(
        undefined,
        { concurrency: 2 },
        routine.routines,
      );
    });

    it('passes concurrency option to pooler', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
      routine.tool.config.execute.concurrency = 3;

      await routine.execute(routine.context);

      expect(routine.poolRoutines).toHaveBeenCalledWith(
        undefined,
        { concurrency: 3 },
        routine.routines,
      );
    });

    it('throws an error if any failures', async () => {
      routine.poolRoutines = jest.fn(() =>
        Promise.resolve({ errors: [new Error('Failed'), new Error('Oops')], results: [] }),
      );

      try {
        await routine.execute(routine.context);
      } catch (error) {
        expect(error).toEqual(
          new Error(
            'Failed to execute pipeline. The following errors have occurred:\n\nFailed\n\nOops',
          ),
        );
      }
    });

    it('returns a result for a single routine', async () => {
      routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [123] }));

      const response = await routine.execute(routine.context);

      expect(response).toEqual(123);
    });

    describe('workspaces', () => {
      beforeEach(() => {
        routine.context.args.priority = true;
        routine.context.args.workspaces = '*';
      });

      it('returns an array of results for multiple routines', async () => {
        const response = await routine.execute(routine.context);

        expect(response.sort()).toEqual(['bar', 'baz', 'foo', 'primary', 'qux']);
      });

      it('serializes priority routines before pooling other routines', async () => {
        routine.poolRoutines = jest.fn(() => Promise.resolve({ errors: [], results: [] }));
        // primary -> foo
        routine.workspacePackages[0].peerDependencies = {
          '@scope/foo': '1.0.0',
        };

        await routine.execute(routine.context);

        expect(routine.poolRoutines).toHaveBeenCalledWith(undefined, {}, [foo, bar, baz, qux]);
        expect(routine.poolRoutines).toHaveBeenCalledWith(undefined, {}, [primary]);
      });
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
      routine.context.args.workspaces = '@scope/(foo|bar)';

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

    it('filters by negation', () => {
      routine.context.args.workspaces = '@scope/!(foo|baz)';

      expect(routine.getFilteredWorkspacePackages()).toEqual([
        {
          name: '@scope/primary',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/primary/package.json'),
        },
        {
          name: '@scope/bar',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/bar/package.json'),
        },
        {
          name: '@scope/qux',
          version: '0.0.0',
          workspace: routine.tool.createWorkspaceMetadata('./packages/qux/package.json'),
        },
      ]);
    });
  });

  describe('orderByWorkspacePriorityGraph()', () => {
    beforeEach(() => {
      routine.context.args.priority = true;
      routine.context.args.workspaces = '*';
    });

    it('returns all in single batch if priority is false', () => {
      routine.context.args.priority = false;
      routine.tool.config.execute.priority = false;

      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[primary, foo, bar, baz, qux]]);
    });

    it('returns all in single batch if workspaces is empty', () => {
      routine.context.args.workspaces = '';

      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[primary, foo, bar, baz, qux]]);
    });

    it('returns all in single batch if no dependents', () => {
      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[bar, baz, foo, primary, qux]]);
    });

    it('prioritizes based on peerDependencies', () => {
      // foo -> bar
      routine.workspacePackages[1].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[bar, baz, primary, qux], [foo]]);
    });

    it('prioritizes based on dependencies', () => {
      // foo -> bar
      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[bar, baz, primary, qux], [foo]]);
    });

    it('sorts priority based on dependency count', () => {
      // bar -> primary
      routine.workspacePackages[2].peerDependencies = {
        '@scope/primary': '2.0.0',
      };

      // foo -> bar
      routine.workspacePackages[1].dependencies = {
        '@scope/bar': '1.0.0',
      };

      // qux -> bar
      routine.workspacePackages[4].peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph()).toEqual([[primary, baz], [bar], [foo, qux]]);
    });
  });
});
