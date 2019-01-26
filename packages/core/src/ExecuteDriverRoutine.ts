/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, WorkspacePackageConfig } from '@boost/core';
import { DepGraph } from 'dependency-graph';
import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './execute/RunCommandRoutine';
import isPatternMatch from './utils/isPatternMatch';
import { BeemoTool } from './types';

export interface CustomConfig {
  priority?: number;
}

export default class ExecuteDriverRoutine extends Routine<DriverContext, BeemoTool> {
  workspacePackages: (WorkspacePackageConfig & CustomConfig)[] = [];

  bootstrap() {
    const { args, primaryDriver, workspaceRoot, workspaces } = this.context;

    if (args.workspaces) {
      if (!workspaces || workspaces.length === 0) {
        throw new Error(
          this.tool.msg('errors:driverWorkspacesNotEnabled', { arg: args.workspaces }),
        );
      }

      this.workspacePackages = this.tool.getWorkspacePackages<CustomConfig>({
        root: workspaceRoot,
      });

      this.getFilteredWorkspacePackages().forEach(pkg => {
        this.pipeParallelBuilds(pkg.workspace.packageName, {
          forceConfigOption: true,
          packageRoot: pkg.workspace.packagePath,
        });
      });
    } else {
      this.pipeParallelBuilds(primaryDriver.name);
    }
  }

  async execute(context: DriverContext): Promise<string[]> {
    const { other, priority } = this.orderByWorkspacePriorityGraph();
    const concurrency = context.args.concurrency || this.tool.config.execute.concurrency;

    await this.serializeRoutines(null, priority);

    const response = await this.poolRoutines(null, concurrency ? { concurrency } : {}, other);

    if (response.errors.length > 0) {
      let message = this.tool.msg('errors:driverExecuteFailed');

      response.errors.forEach(error => {
        message += '\n\n';
        message += error.message.split(/\s+at\s+/u)[0].trim();
      });

      throw new Error(message);
    }

    return response.results;
  }

  /**
   * Return a list of workspaces optionally filtered.
   */
  getFilteredWorkspacePackages(): (WorkspacePackageConfig & CustomConfig)[] {
    return this.workspacePackages.filter(pkg =>
      // @ts-ignore Contains not typed yet
      isPatternMatch(pkg.name, this.context.args.workspaces, { contains: true }),
    );
  }

  /**
   * Group routines in order of which they are dependend on.
   */
  orderByWorkspacePriorityGraph(): {
    other: Routine<DriverContext, BeemoTool>[];
    priority: Routine<DriverContext, BeemoTool>[];
  } {
    const enabled = this.context.args.priority || this.tool.config.execute.priority;

    if (!enabled || !this.context.args.workspaces) {
      return {
        other: this.routines,
        priority: [],
      };
    }

    const graph = new DepGraph<WorkspacePackageConfig & CustomConfig>({ circular: true });
    // const packages: { [name: string]: WorkspacePackageConfig & CustomConfig } = {};
    // const depCounts: { [name: string]: { count: number; package: WorkspacePackageConfig } } = {};

    // function countDep(name: string) {
    //   if (depCounts[name]) {
    //     depCounts[name].count += 1;
    //   } else {
    //     depCounts[name] = {
    //       count: packages[name].priority || 1,
    //       package: packages[name],
    //     };
    //   }
    // }

    // Create a mapping of package names within all workspaces
    this.workspacePackages.forEach(pkg => {
      graph.addNode(pkg.name, pkg);

      // packages[pkg.name] = pkg;

      // // Count it immediately, as it may not be dependend on
      // if (pkg.priority) {
      //   countDep(pkg.name);
      // }
    });

    // Determine dependend on packages by resolving the graph and incrementing counts
    this.workspacePackages.forEach(pkg => {
      const deps = {
        ...pkg.dependencies,
        ...pkg.peerDependencies,
      };

      Object.keys(deps).forEach(depName => {
        if (!graph.hasNode(depName)) {
          graph.addNode(depName);
        }

        graph.addDependency(pkg.name, depName);
      });

      // Object.keys(deps).forEach(depName => {
      //   if (packages[depName]) {
      //     countDep(depName);
      //   }
      // });
    });

    // Order by highest count
    // const orderedDeps = Object.values(depCounts)
    //   .sort((a, b) => b.count - a.count)
    //   .map(dep => dep.package);
    const orderedDeps = graph.overallOrder();

    console.log(graph, orderedDeps);

    // Extract dependents in order
    const priority: Routine<DriverContext, BeemoTool>[] = [];
    const other: Routine<DriverContext, BeemoTool>[] = [];

    orderedDeps.forEach(pkgName => {
      const pkg = graph.getNodeData(pkgName);

      console.log(pkgName, graph.dependantsOf(pkgName), graph.dependenciesOf(pkgName));

      // DepGraph returns the node name when no data is found
      if (!pkg || typeof pkg === 'string') {
        return;
      }

      const routine = this.routines.find(route => route.key === pkg.workspace.packageName);

      if (!routine) {
        return;
      }

      if (graph.dependantsOf(pkgName).length > 0) {
        priority.push(routine);
      } else {
        other.push(routine);
      }
    });

    // Extract dependers
    // const other: Routine<DriverContext, BeemoTool>[] = [];

    // this.routines.forEach(routine => {
    //   const dependency = orderedDeps.find(depName => depName === routine.key);

    //   if (!dependency) {
    //     other.push(routine);
    //   }
    // });

    return {
      other,
      priority,
    };
  }

  /**
   * When a parallel pipe "//" is defined, we need to create an additional routine
   * for each instance.
   */
  pipeParallelBuilds(key: string, options: Partial<RunCommandOptions> = {}) {
    const { argv, parallelArgv, primaryDriver } = this.context;
    const command = `${primaryDriver.metadata.bin} ${argv.join(' ')}`;

    this.pipe(new RunCommandRoutine(key, command, options));

    parallelArgv.forEach(pargv => {
      this.pipe(
        new RunCommandRoutine(key, `${command} ${pargv.join(' ')}`, {
          ...options,
          additionalArgv: pargv,
        }),
      );
    });
  }
}
