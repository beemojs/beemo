/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import glob from 'glob';
import { Routine, RoutineInterface, SynchronizedResponse } from 'boost';
import RunCommandRoutine from './driver/RunCommandRoutine';
import isPatternMatch from './utils/isPatternMatch';
import { BeemoConfig, DriverContext } from './types';

export default class ExecuteDriverRoutine extends Routine<BeemoConfig, DriverContext> {
  bootstrap() {
    const { args, argv, primaryDriver, workspaces } = this.context;
    const driverName = primaryDriver.name;
    const command = `${primaryDriver.metadata.bin} ${argv.join(' ')}`;

    if (args.workspaces) {
      if (workspaces.length === 0) {
        throw new Error('Option --workspaces provided but project is not workspaces enabled.');
      }

      this.getWorkspaceFilteredPaths().forEach(filePath => {
        this.pipe(
          new RunCommandRoutine(path.basename(filePath), command, {
            forceConfigOption: true,
            workspaceRoot: filePath,
          }),
        );
      });
    } else {
      this.pipe(new RunCommandRoutine(driverName, command));
    }
  }

  execute(context: DriverContext): Promise<string[]> {
    const { other, priority } = this.groupRoutinesByPriority();

    return this.serializeRoutines(null, priority).then(() =>
      this.synchronizeRoutines(null, other).then(response => {
        if (response.errors.length > 0) {
          throw new Error('Execution failure.');
        }

        return response.results;
      }),
    );
  }

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

  groupRoutinesByPriority(): { priority: RoutineInterface[]; other: RoutineInterface[] } {
    const priorityNames: string[] = this.context.args.priority.split(',');

    // Extract high priority in order provided
    const priority: RoutineInterface[] = [];

    priorityNames.forEach(name => {
      this.routines.forEach(routine => {
        if (isPatternMatch(routine.key, name)) {
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
}
