/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, WorkspacePackageConfig } from '@boost/core';
import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './execute/RunCommandRoutine';
import BaseExecuteRoutine, { CustomConfig } from './BaseExecuteRoutine';
import { BeemoTool } from './types';

export default class ExecuteDriverRoutine extends BaseExecuteRoutine<DriverContext> {
  async execute(context: DriverContext): Promise<any[]> {
    const { other, priority } = this.orderByWorkspacePriorityGraph();
    const concurrency = context.args.concurrency || this.tool.config.execute.concurrency;

    await this.serializeRoutines(null, priority);

    const response = await this.poolRoutines(null, concurrency ? { concurrency } : {}, other);

    if (response.errors.length > 0) {
      this.formatAndThrowErrors(response.errors);
    }

    return response.results;
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

    const packages: { [name: string]: WorkspacePackageConfig & CustomConfig } = {};
    const depCounts: { [name: string]: { count: number; package: WorkspacePackageConfig } } = {};

    function countDep(name: string) {
      if (depCounts[name]) {
        depCounts[name].count += 1;
      } else {
        depCounts[name] = {
          count: packages[name].priority || 1,
          package: packages[name],
        };
      }
    }

    // Create a mapping of package names within all workspaces
    this.workspacePackages.forEach(pkg => {
      packages[pkg.name] = pkg;

      // Count it immediately, as it may not be dependend on
      if (pkg.priority) {
        countDep(pkg.name);
      }
    });

    // Determine dependend on packages by resolving the graph and incrementing counts
    this.workspacePackages.forEach(pkg => {
      const deps = {
        ...pkg.dependencies,
        ...pkg.peerDependencies,
      };

      Object.keys(deps).forEach(depName => {
        if (packages[depName]) {
          countDep(depName);
        }
      });
    });

    // Order by highest count
    const orderedDeps = Object.values(depCounts)
      .sort((a, b) => b.count - a.count)
      .map(dep => dep.package);

    // Extract dependents in order
    const priority: Routine<DriverContext, BeemoTool>[] = [];

    orderedDeps.forEach(pkg => {
      const routine = this.routines.find(route => route.key === pkg.workspace.packageName);

      if (routine) {
        priority.push(routine);
      }
    });

    // Extract dependers
    const other: Routine<DriverContext, BeemoTool>[] = [];

    this.routines.forEach(routine => {
      const dependency = orderedDeps.find(dep => dep.workspace.packageName === routine.key);

      if (!dependency) {
        other.push(routine);
      }
    });

    return {
      other,
      priority,
    };
  }

  pipeRoutine() {
    this.pipeParallelBuilds(this.context.primaryDriver.name);
  }

  pipeWorkspaceRoutine(packageName: string, packageRoot: string) {
    this.pipeParallelBuilds(packageName, {
      forceConfigOption: true,
      packageRoot,
    });
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
