import { Routine } from '@boost/core';
import Driver from '../../src/Driver';
import RunInWorkspacesRoutine, {
  RunInWorkspacesContextArgs,
} from '../../src/routines/RunInWorkspacesRoutine';
import { mockTool, mockDriver, stubDriverContext, mockDebugger } from '../../src/testUtils';
import Context from '../../src/contexts/Context';
import Beemo from '../../src/Beemo';

class PipedRoutine extends Routine<Context<$FixMe>, Beemo> {
  execute() {
    return Promise.resolve(this.key);
  }
}

class ExecuteRoutine extends RunInWorkspacesRoutine<Context<$FixMe>> {
  pipeRoutine(packageName?: string, packageRoot?: string) {
    this.pipe(new PipedRoutine(packageName || 'root', packageRoot || ''));
  }
}

describe('RunInWorkspacesRoutine', () => {
  let routine: RunInWorkspacesRoutine<Context<RunInWorkspacesContextArgs>>;
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
      const spy = jest
        .spyOn(routine, 'poolRoutines')
        .mockImplementation(() => Promise.resolve({ errors: [], results: [] }));

      await routine.execute(routine.context);

      expect(spy).toHaveBeenCalledWith(undefined, {}, routine.routines);
    });

    it('passes concurrency to pooler', async () => {
      const spy = jest
        .spyOn(routine, 'poolRoutines')
        .mockImplementation(() => Promise.resolve({ errors: [], results: [] }));

      routine.context.args.concurrency = 2;

      await routine.execute(routine.context);

      expect(spy).toHaveBeenCalledWith(undefined, { concurrency: 2 }, routine.routines);
    });

    it('passes concurrency option to pooler', async () => {
      const spy = jest
        .spyOn(routine, 'poolRoutines')
        .mockImplementation(() => Promise.resolve({ errors: [], results: [] }));

      routine.tool.config.execute.concurrency = 3;

      await routine.execute(routine.context);

      expect(spy).toHaveBeenCalledWith(undefined, { concurrency: 3 }, routine.routines);
    });

    it('throws an error if any failures', async () => {
      jest.spyOn(routine, 'poolRoutines').mockImplementation(() => {
        const a = new Error('Failed');
        // @ts-ignore
        a.stdout = 'Stdout info...';

        const b = new Error('Oops');
        // @ts-ignore
        b.stderr = 'Stderr message!';

        return Promise.resolve({ errors: [a, b], results: [] });
      });

      try {
        await routine.execute(routine.context);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });

    it('returns a result for a single routine', async () => {
      jest
        .spyOn(routine, 'poolRoutines')
        .mockImplementation(() => Promise.resolve({ errors: [], results: [123] }));

      const response = await routine.execute(routine.context);

      expect(response).toEqual(123);
    });

    describe('workspaces', () => {
      beforeEach(() => {
        routine.context.args.graph = true;
        routine.context.args.workspaces = '*';
      });

      it('returns an array of results for multiple routines', async () => {
        const response = await routine.execute(routine.context);

        expect((response as string[]).sort()).toEqual(['bar', 'baz', 'foo', 'primary', 'qux']);
      });

      it('serializes priority routines before pooling other routines', async () => {
        const spy = jest
          .spyOn(routine, 'poolRoutines')
          .mockImplementation(() => Promise.resolve({ errors: [], results: [] }));

        // primary -> foo
        routine.workspacePackages[0].peerDependencies = {
          '@scope/foo': '1.0.0',
        };

        await routine.execute(routine.context);

        expect(spy).toHaveBeenCalledWith(undefined, {}, [foo, bar, baz, qux]);
        expect(spy).toHaveBeenCalledWith(undefined, {}, [primary]);
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
      routine.context.args.graph = true;
      routine.context.args.workspaces = '*';
    });

    it('returns all in single batch if graph is false', () => {
      routine.context.args.graph = false;
      routine.tool.config.execute.graph = false;

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
