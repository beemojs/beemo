import { Routine, WorkspacePackageConfig } from '@boost/core';
import Graph, { TreeNode } from '@beemo/dependency-graph';
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

    const tree = new Graph(this.workspacePackages).resolveTree();
    const priority: Routine<Ctx, BeemoTool>[] = [];
    const other: Routine<Ctx, BeemoTool>[] = [];

    const handler = (node: TreeNode<WorkspacePackageConfig>) => {
      const routine = this.routines.find(route => route.key === node.package.workspace.packageName);

      if (routine) {
        if (node.leaf) {
          other.push(routine);
        } else {
          priority.push(routine);
        }
      }

      if (node.nodes) {
        node.nodes.forEach(childNode => handler(childNode));
      }
    };

    tree.nodes.forEach(node => handler(node));

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
