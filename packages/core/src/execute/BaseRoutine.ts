import { Routine, WorkspacePackageConfig } from '@boost/core';
import Context from '../contexts/Context';
import isPatternMatch from '../utils/isPatternMatch';
import { BeemoTool } from '../types';

export interface CustomConfig {
  priority?: number;
}

export default abstract class BaseRoutine<Ctx extends Context> extends Routine<Ctx, BeemoTool> {
  workspacePackages: (WorkspacePackageConfig & CustomConfig)[] = [];

  bootstrap() {
    const { args, workspaceRoot, workspaces } = this.context;

    if (args.workspaces) {
      if (!workspaces || workspaces.length === 0) {
        throw new Error(this.tool.msg('errors:workspacesNotEnabled', { arg: args.workspaces }));
      }

      this.workspacePackages = this.tool.getWorkspacePackages({
        root: workspaceRoot,
      });

      this.getFilteredWorkspacePackages().forEach(pkg => {
        this.pipeRoutine(pkg.workspace.packageName, pkg.workspace.packagePath);
      });
    } else {
      this.pipeRoutine();
    }
  }

  async execute(context: Ctx): Promise<any[]> {
    const value = await this.serializeTasks();
    const { other, priority } = this.orderByWorkspacePriorityGraph();

    await this.serializeRoutines(value, priority);

    const concurrency = (context.args.concurrency ||
      this.tool.config.execute.concurrency) as number;
    const response = await this.poolRoutines(value, concurrency ? { concurrency } : {}, other);

    if (response.errors.length > 0) {
      this.formatAndThrowErrors(response.errors);
    }

    // Not running in workspaces, so return value directly
    return context.args.workspaces ? response.results : response.results[0];
  }

  /**
   * When a list of errors are available, concatenate them and throw a new error.
   */
  formatAndThrowErrors(errors: Error[]) {
    let message = this.tool.msg('errors:executeFailed');

    errors.forEach(error => {
      message += '\n\n';
      message += error.message.split(/\s+at\s+/u)[0].trim();
    });

    throw new Error(message);
  }

  /**
   * Return a list of workspaces optionally filtered.
   */
  getFilteredWorkspacePackages(): WorkspacePackageConfig[] {
    return this.workspacePackages.filter(pkg =>
      isPatternMatch(pkg.name, this.context.args.workspaces as string),
    );
  }

  /**
   * Group routines in order of which they are dependend on.
   */
  orderByWorkspacePriorityGraph(): {
    other: Routine<Ctx, BeemoTool>[];
    priority: Routine<Ctx, BeemoTool>[];
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
    const priority: Routine<Ctx, BeemoTool>[] = [];

    orderedDeps.forEach(pkg => {
      const routine = this.routines.find(route => route.key === pkg.workspace.packageName);

      if (routine) {
        priority.push(routine);
      }
    });

    // Extract dependers
    const other: Routine<Ctx, BeemoTool>[] = [];

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

  /**
   * Pipe a routine for the entire project or a workspace package at the defined path.
   */
  abstract pipeRoutine(packageName?: string, packageRoot?: string): void;
}
