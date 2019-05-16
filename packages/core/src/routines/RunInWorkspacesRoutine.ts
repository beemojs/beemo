import { Routine, WorkspacePackageConfig } from '@boost/core';
import Graph from '@beemo/dependency-graph';
import Beemo from '../Beemo';
import Context from '../contexts/Context';
import isPatternMatch from '../utils/isPatternMatch';

export interface RunInWorkspacesContextArgs {
  concurrency: number;
  graph: boolean;
  workspaces: string;
}

export default abstract class RunInWorkspacesRoutine<
  Ctx extends Context<RunInWorkspacesContextArgs>
> extends Routine<Ctx, Beemo> {
  workspacePackages: WorkspacePackageConfig[] = [];

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
    const batches = this.orderByWorkspacePriorityGraph();
    const allErrors: Error[] = [];
    const allResults: any[] = [];

    const concurrency = context.args.concurrency || this.tool.config.execute.concurrency;

    // eslint-disable-next-line no-restricted-syntax
    for (const batch of batches) {
      // eslint-disable-next-line no-await-in-loop
      const { errors, results } = await this.poolRoutines(
        value,
        concurrency ? { concurrency } : {},
        batch,
      );

      allResults.push(...results);

      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    }

    if (allErrors.length > 0) {
      this.formatAndThrowErrors(allErrors);
    }

    // Not running in workspaces, so return value directly
    return context.args.workspaces ? allResults : allResults[0];
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
      isPatternMatch(pkg.name, this.context.args.workspaces),
    );
  }

  /**
   * Group routines in order of which they are dependend on.
   */
  orderByWorkspacePriorityGraph(): Routine<Ctx, Beemo>[][] {
    const enabled = this.context.args.graph || this.tool.config.execute.graph;

    if (!enabled || !this.context.args.workspaces) {
      return [this.routines];
    }

    const batchList = new Graph(this.workspacePackages).resolveBatchList();
    const batches: Routine<Ctx, Beemo>[][] = [];

    batchList.forEach(batch => {
      const routines = batch
        .map(pkg => this.routines.find(route => route.key === pkg.workspace.packageName))
        .filter(Boolean) as Routine<Ctx, Beemo>[];

      if (routines.length > 0) {
        batches.push(routines);
      }
    });

    return batches;
  }

  /**
   * Pipe a routine for the entire project or a workspace package at the defined path.
   */
  abstract pipeRoutine(packageName?: string, packageRoot?: string): void;
}
