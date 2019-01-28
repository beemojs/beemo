/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, WorkspacePackageConfig } from '@boost/core';
import Context from './contexts/Context';
import { BeemoTool } from './types';

export interface CustomConfig {
  priority?: number;
}

export default abstract class BaseExecuteRoutine<Ctx extends Context> extends Routine<
  Ctx,
  BeemoTool
> {
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
        this.pipeWorkspaceRoutine(pkg.workspace.packageName, pkg.workspace.packagePath);
      });
    } else {
      this.pipeRoutine();
    }
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
      // @ts-ignore Contains not typed yet
      isPatternMatch(pkg.name, this.context.args.workspaces, { contains: true }),
    );
  }

  /**
   * Pipe a routine for the project itself (usually a solorepo).
   */
  abstract pipeRoutine(): void;

  /**
   * Pipe a routine for the workspace package at the defined path.
   */
  abstract pipeWorkspaceRoutine(packageName: string, packageRoot: string): void;
}
