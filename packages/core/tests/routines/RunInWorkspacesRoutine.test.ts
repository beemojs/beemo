import { Predicates } from '@boost/common';
import { Routine } from '@boost/pipeline';
import Context from '../../src/contexts/Context';
import Driver from '../../src/Driver';
import RunInWorkspacesRoutine, {
  RunInWorkspacesContextArgs,
} from '../../src/routines/RunInWorkspacesRoutine';
import { mockDebugger, mockDriver, mockTool, stubDriverContext } from '../../src/test';
import Tool from '../../src/Tool';

type Ctx = Context<RunInWorkspacesContextArgs>;

class PipedRoutine extends Routine<unknown, unknown, { error?: Error; type?: string }> {
  blueprint({ instance, string }: Predicates) {
    return {
      error: instance(Error).nullable(),
      type: string(),
    };
  }

  execute() {
    const { error } = this.options;

    if (error) {
      if (this.options.type === 'stderr') {
        // @ts-expect-error
        error.stderr = 'Stderr message!';
      } else {
        // @ts-expect-error
        error.stdout = 'Stdout info...';
      }

      throw error;
    }

    return Promise.resolve(this.key);
  }
}

class ExecuteRoutine extends RunInWorkspacesRoutine<Ctx> {
  pipeRoutine(context: Ctx, packageName?: string, packageRoot?: string) {
    this.routines.push(new PipedRoutine(packageName || 'root', packageRoot || 'description'));
  }
}

describe('RunInWorkspacesRoutine', () => {
  let context: Ctx;
  let tool: Tool;
  let routine: RunInWorkspacesRoutine<Ctx>;
  let driver: Driver;
  let primary: PipedRoutine;
  let foo: PipedRoutine;
  let bar: PipedRoutine;
  let baz: PipedRoutine;
  let qux: PipedRoutine;

  beforeEach(() => {
    tool = mockTool();
    context = stubDriverContext(driver);
    driver = mockDriver('primary', tool);

    routine = new ExecuteRoutine('driver', 'Executing driver', { tool });
    // @ts-expect-error
    routine.debug = mockDebugger();

    // Setup packages
    primary = new PipedRoutine('primary', 'primary');
    foo = new PipedRoutine('foo', 'foo');
    bar = new PipedRoutine('bar', 'bar');
    baz = new PipedRoutine('baz', 'baz');
    qux = new PipedRoutine('qux', 'qux');

    routine.routines.push(primary);
    routine.routines.push(foo);
    routine.routines.push(bar);
    routine.routines.push(baz);
    routine.routines.push(qux);

    const packages = [
      {
        package: { name: '@scope/primary', version: '0.0.0' },
        metadata: tool.project.createWorkspaceMetadata('./packages/primary/package.json'),
      },
      {
        package: { name: '@scope/foo', version: '0.0.0' },
        metadata: tool.project.createWorkspaceMetadata('./packages/foo/package.json'),
      },
      {
        package: { name: '@scope/bar', version: '0.0.0' },
        metadata: tool.project.createWorkspaceMetadata('./packages/bar/package.json'),
      },
      {
        package: { name: '@scope/baz', version: '0.0.0' },
        metadata: tool.project.createWorkspaceMetadata('./packages/baz/package.json'),
      },
      {
        package: { name: '@scope/qux', version: '0.0.0' },
        metadata: tool.project.createWorkspaceMetadata('./packages/qux/package.json'),
      },
    ];

    routine.workspacePackages = packages;
    jest.spyOn(tool.project, 'getWorkspacePackages').mockImplementation(() => packages);
  });

  describe('execute()', () => {
    it('throws an error if any failures', async () => {
      routine.routines = [
        new PipedRoutine('out', 'Out', { error: new Error('Failed'), type: 'stdout' }),
        new PipedRoutine('err', 'Err', { error: new Error('Oops'), type: 'stderr' }),
      ];

      try {
        await routine.execute(context);
      } catch (error) {
        expect(error).toMatchSnapshot();
      }
    });

    it('returns a result for a single routine', async () => {
      routine.routines = [foo];

      const response = await routine.execute(context);

      expect(response).toEqual('foo');
    });

    describe('workspaces', () => {
      beforeEach(() => {
        context.args.options.graph = true;
        context.args.options.workspaces = '*';
        context.workspaces = ['packages/*'];
      });

      it('returns an array of results for multiple routines', async () => {
        const response = await routine.execute(context);

        expect((response as string[]).sort()).toEqual(['bar', 'baz', 'foo', 'primary', 'qux']);
      });

      it('serializes priority routines before pooling other routines', async () => {
        const spy = jest.spyOn(routine, 'orderByWorkspacePriorityGraph');

        // primary -> foo
        routine.workspacePackages[0].package.peerDependencies = {
          '@scope/foo': '1.0.0',
        };

        await routine.execute(context);

        expect(spy).toHaveReturnedWith([[foo, bar, baz, qux], [primary]]);
      });
    });
  });

  describe('getFilteredWorkspaces()', () => {
    it('returns none for empty string', () => {
      context.args.options.workspaces = '';

      expect(routine.getFilteredWorkspacePackages(context)).toEqual([]);
    });

    it('returns all for wildcard `*`', () => {
      context.args.options.workspaces = '*';

      expect(routine.getFilteredWorkspacePackages(context)).toEqual([
        {
          package: { name: '@scope/primary', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/primary/package.json'),
        },
        {
          package: { name: '@scope/foo', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/foo/package.json'),
        },
        {
          package: { name: '@scope/bar', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/bar/package.json'),
        },
        {
          package: { name: '@scope/baz', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/baz/package.json'),
        },
        {
          package: { name: '@scope/qux', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/qux/package.json'),
        },
      ]);
    });

    it('filters by package name', () => {
      context.args.options.workspaces = '@scope/(foo|bar)';

      expect(routine.getFilteredWorkspacePackages(context)).toEqual([
        {
          package: { name: '@scope/foo', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/foo/package.json'),
        },
        {
          package: { name: '@scope/bar', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/bar/package.json'),
        },
      ]);
    });

    it('filters by negation', () => {
      context.args.options.workspaces = '@scope/!(foo|baz)';

      expect(routine.getFilteredWorkspacePackages(context)).toEqual([
        {
          package: { name: '@scope/primary', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/primary/package.json'),
        },
        {
          package: { name: '@scope/bar', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/bar/package.json'),
        },
        {
          package: { name: '@scope/qux', version: '0.0.0' },
          metadata: tool.project.createWorkspaceMetadata('./packages/qux/package.json'),
        },
      ]);
    });
  });

  describe('orderByWorkspacePriorityGraph()', () => {
    beforeEach(() => {
      context.args.options.graph = true;
      context.args.options.workspaces = '*';
    });

    it('returns all in single batch if graph is false', () => {
      context.args.options.graph = false;
      tool.config.execute.graph = false;

      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [primary, foo, bar, baz, qux],
      ]);
    });

    it('returns all in single batch if workspaces is empty', () => {
      context.args.options.workspaces = '';

      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [primary, foo, bar, baz, qux],
      ]);
    });

    it('returns all in single batch if no dependents', () => {
      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [bar, baz, foo, primary, qux],
      ]);
    });

    it('prioritizes based on peerDependencies', () => {
      // foo -> bar
      routine.workspacePackages[1].package.peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [bar, baz, primary, qux],
        [foo],
      ]);
    });

    it('prioritizes based on dependencies', () => {
      // foo -> bar
      routine.workspacePackages[1].package.dependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [bar, baz, primary, qux],
        [foo],
      ]);
    });

    it('sorts priority based on dependency count', () => {
      // bar -> primary
      routine.workspacePackages[2].package.peerDependencies = {
        '@scope/primary': '2.0.0',
      };

      // foo -> bar
      routine.workspacePackages[1].package.dependencies = {
        '@scope/bar': '1.0.0',
      };

      // qux -> bar
      routine.workspacePackages[4].package.peerDependencies = {
        '@scope/bar': '1.0.0',
      };

      expect(routine.orderByWorkspacePriorityGraph(context)).toEqual([
        [primary, baz],
        [bar],
        [foo, qux],
      ]);
    });
  });
});
