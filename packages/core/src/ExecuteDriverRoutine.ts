/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import glob from 'glob';
import trim from 'lodash/trim';
import { Routine, RoutineInterface } from 'boost';
import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './driver/RunCommandRoutine';
import isPatternMatch from './utils/isPatternMatch';
import { BeemoConfig } from './types';

export default class ExecuteDriverRoutine extends Routine<BeemoConfig, DriverContext> {
  bootstrap() {
    const { args, primaryDriver, workspaces } = this.context;

    if (args.workspaces) {
      if (!workspaces || workspaces.length === 0) {
        throw new Error(
          `Option --workspaces=${args.workspaces} provided but project is not workspaces enabled.`,
        );
      }

      this.getWorkspaceFilteredPaths().forEach(filePath => {
        this.pipeParallelBuilds(path.basename(filePath), {
          forceConfigOption: true,
          workspaceRoot: filePath,
        });
      });
    } else {
      this.pipeParallelBuilds(primaryDriver.name);
    }
  }

  execute(context: DriverContext): Promise<string[]> {
    const { other, priority } = this.groupRoutinesByPriority();

    return this.serializeRoutines(null, priority).then(() =>
      this.poolRoutines(null, {}, other).then(response => {
        if (response.errors.length > 0) {
          const messages = response.errors.map(error => error.message);

          throw new Error(`Execution failure.\n${messages.join('\n\n')}`);
        }

        return response.results;
      }),
    );
  }

  /**
   * Return a list of workspace paths optionally filtered.
   */
  getWorkspaceFilteredPaths(): string[] {
    const { args, root, workspaces } = this.context;

    return glob
      .sync(`${workspaces}/`, {
        absolute: true,
        cwd: root,
        debug: this.tool.config.debug,
        strict: true,
      })
      .filter(filePath => isPatternMatch(path.basename(filePath), args.workspaces));
  }

  /**
   * Group routines in order of defined priority.
   */
  groupRoutinesByPriority(): {
    priority: RoutineInterface[];
    other: RoutineInterface[];
  } {
    const priorityNames: string[] = String(this.context.getArg('priority', '')).split(',');

    // Extract high priority in order provided
    const priority: RoutineInterface[] = [];

    priorityNames.forEach(name => {
      this.routines.forEach(routine => {
        if (routine.key === name) {
          priority.push(routine);
        }
      });
    });

    // Extract all others
    const other = this.routines.filter(routine => !priorityNames.includes(routine.key));

    return {
      other,
      priority,
    };
  }

  /**
   * When a --parallel option is defined, we need to create an additional routine for each instance.
   */
  pipeParallelBuilds(key: string, options: Partial<RunCommandOptions> = {}) {
    const { args, argv, primaryDriver } = this.context;
    const filteredArgv = argv.filter(arg => !arg.includes('--parallel'));
    const command = `${primaryDriver.metadata.bin} ${filteredArgv.join(' ')}`;

    if (Array.isArray(args.parallel) && args.parallel.length > 0) {
      args.parallel.forEach(pargv => {
        const trimmedPargv = trim(pargv, '"').trim();

        this.pipe(
          new RunCommandRoutine(key, `${command} ${trimmedPargv}`, {
            ...options,
            additionalArgv: trimmedPargv.split(/ /g),
          }),
        );
      });
    } else {
      this.pipe(new RunCommandRoutine(key, command, options));
    }
  }
}
