import Graph from '@beemo/dependency-graph';
import { Blueprint, PackageStructure,Predicates, WorkspacePackage } from '@boost/common';
import { PooledPipeline,Routine } from '@boost/pipeline';
import { stripAnsi, style } from '@boost/terminal';
import Context from '../contexts/Context';
import isPatternMatch from '../helpers/isPatternMatch';
import { ExecutionError, RoutineOptions } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRoutine = Routine<any, any>;

export interface RunInWorkspacesContextArgs {
  concurrency: number;
  graph: boolean;
  workspaces: string;
}

const MAX_ERROR_LINES = 5;

export default abstract class RunInWorkspacesRoutine<
  Ctx extends Context<RunInWorkspacesContextArgs>
> extends Routine<unknown, unknown, RoutineOptions> {
  routines: AnyRoutine[] = [];

  workspacePackages: WorkspacePackage[] = [];

  blueprint({ instance }: Predicates): Blueprint<RoutineOptions> {
    return {
      // @ts-expect-error We cant import Tool because of cycles
      tool: instance().required().notNullable(),
    };
  }

  async execute(context: Ctx): Promise<unknown> {
    const { args, workspaces } = context;
    const { tool } = this.options;

    // Determine packages to run plugins in
    if (args.options.workspaces) {
      if (!workspaces || workspaces.length === 0) {
        throw new Error(tool.msg('errors:workspacesNotEnabled', { arg: args.options.workspaces }));
      }

      this.workspacePackages = tool.project.getWorkspacePackages();

      this.getFilteredWorkspacePackages(context).forEach((pkg) => {
        this.pipeRoutine(context, pkg.metadata.packageName, pkg.metadata.packagePath);
      });
    } else {
      this.pipeRoutine(context);
    }

    const value = await this.getInitialValue(context);
    const batches = this.orderByWorkspacePriorityGraph(context);
    const allErrors: Error[] = [];
    const allResults: unknown[] = [];
    const concurrency =
      context.args.options.concurrency || tool.config.execute.concurrency || undefined;

    // eslint-disable-next-line no-restricted-syntax
    for (const batch of batches) {
      const pipeline = batch.reduce(
        (pl, routine) => pl.add(routine),
        new PooledPipeline(context, value, { concurrency }),
      );

      // eslint-disable-next-line no-await-in-loop
      const { errors, results } = await pipeline.run();

      allResults.push(...results);

      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    }

    if (allErrors.length > 0) {
      this.formatAndThrowErrors(allErrors);
    }

    // Not running in workspaces, so return value directly
    return context.args.options.workspaces ? allResults : allResults[0];
  }

  /**
   * When a list of errors are available, concatenate them and throw a new error.
   */
  formatAndThrowErrors(errors: Error[]) {
    let message = this.options.tool.msg('errors:executeFailed');

    (errors as ExecutionError[]).forEach((error) => {
      let content = stripAnsi(error.stderr || error.stdout || '')
        .trim()
        .split('\n');

      // istanbul ignore next
      if (content.length >= MAX_ERROR_LINES) {
        const count = content.length - MAX_ERROR_LINES;

        content = content.slice(0, MAX_ERROR_LINES);

        if (count > 0) {
          content.push(this.options.tool.msg('errors:executeFailedMoreLines', { count }));
        }
      }

      message += '\n\n';
      message += style.reset.yellow(error.message);

      if (content.length > 0) {
        message += '\n';
        message += style.reset.gray(content.join('\n'));
      }
    });

    message += '\n';

    const error = new Error(message);

    // Inherit stack for easier debugging.
    if (errors.length === 1) {
      error.stack = String(errors[0].stack).split('\n').slice(1).join('\n');
    }

    throw error;
  }

  /**
   * Return a list of workspaces optionally filtered.
   */
  getFilteredWorkspacePackages(context: Ctx): WorkspacePackage[] {
    return this.workspacePackages.filter((pkg) =>
      isPatternMatch(pkg.package.name, context.args.options.workspaces),
    );
  }

  /**
   * Return the initial value for the pipeline.
   */
  getInitialValue(context: Ctx): unknown {
    return null;
  }

  /**
   * Group routines in order of which they are dependend on.
   */
  orderByWorkspacePriorityGraph(context: Ctx): AnyRoutine[][] {
    const enabled = context.args.options.graph || this.options.tool.config.execute.graph || false;

    if (!enabled || !context.args.options.workspaces) {
      return [this.routines];
    }

    // Create lookups
    const packages: PackageStructure[] = []; // Without metadata
    const metadata: { [name: string]: WorkspacePackage['metadata'] } = {}; // By package name

    this.workspacePackages.forEach((wsp) => {
      packages.push(wsp.package);
      metadata[wsp.package.name] = wsp.metadata;
    });

    // Batch based on packages
    const batchList = new Graph(packages).resolveBatchList();
    const batches: AnyRoutine[][] = [];

    batchList.forEach((batch) => {
      const routines = batch
        .map((pkg) => this.routines.find((route) => route.key === metadata[pkg.name].packageName))
        .filter(Boolean) as AnyRoutine[];

      if (routines.length > 0) {
        batches.push(routines);
      }
    });

    return batches;
  }

  /**
   * Pipe a routine for the entire project or a workspace package at the defined path.
   */
  abstract pipeRoutine(context: Ctx, packageName?: string, packageRoot?: string): void;
}
