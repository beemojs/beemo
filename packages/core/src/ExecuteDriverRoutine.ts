/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import glob from 'glob';
import { Routine, SynchronizedResponse } from 'boost';
import RunCommandRoutine from './driver/RunCommandRoutine';
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
    return this.synchronizeRoutines().then(response => {
      if (response.errors.length > 0) {
        throw new Error('Execution failure.');
      }

      return response.results;
    });
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
      .filter(
        filePath =>
          args.workspaces === '*' ||
          path.basename(filePath).match(new RegExp(args.workspaces.replace(/,/g, '|'))),
      );
  }
}
