import { Routine, WorkspacePackageConfig, AggregatedResponse } from '@boost/core';
import Graph from '@beemo/dependency-graph';
import Context from '../contexts/Context';
import isPatternMatch from '../utils/isPatternMatch';
import { BeemoTool } from '../types';

export interface BaseContextArgs {
  concurrency: number;
  priority: boolean;
  workspaces: string;
}

export default abstract class BaseRoutine<Ctx extends Context<BaseContextArgs>> extends Routine<
  Ctx,
  BeemoTool
> {
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
    const errors: Error[] = [];

    const concurrency = context.args.concurrency || this.tool.config.execute.concurrency;
    const responses: AggregatedResponse[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const batch of batches) {
      // eslint-disable-next-line no-await-in-loop
      const response = await this.poolRoutines(value, concurrency ? { concurrency } : {}, batch);

      responses.push(response);

      if (response.errors.length > 0) {
        errors.push(...response.errors);
      }
    }

    if (errors.length > 0) {
      this.formatAndThrowErrors(errors);
    }

    if (context.args.workspaces) {
      const results: any[] = [];

      responses.forEach(response => results.push(...response.results));

      return results;
    }

    // Not running in workspaces, so return value directly
    return responses[0].results[0];
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
  orderByWorkspacePriorityGraph(): Routine<Ctx, BeemoTool>[][] {
    const enabled = this.context.args.priority || this.tool.config.execute.priority;

    if (!enabled || !this.context.args.workspaces) {
      return [this.routines];
    }

    const batchList = new Graph(this.workspacePackages).resolveBatchList();
    const batches: Routine<Ctx, BeemoTool>[][] = [];

    batchList.forEach(batch => {
      const routines = batch
        .map(pkg => this.routines.find(route => route.key === pkg.workspace.packageName))
        .filter(Boolean) as Routine<Ctx, BeemoTool>[];

      batches.push(routines);
    });

    return batches;
  }

  /**
   * Pipe a routine for the entire project or a workspace package at the defined path.
   */
  abstract pipeRoutine(packageName?: string, packageRoot?: string): void;
}
