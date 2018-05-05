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
    const { args, argv, primaryDriver, root, workspaces } = this.context;
    const driverName = primaryDriver.name;
    const command = `${primaryDriver.metadata.bin} ${argv.join(' ')}`;

    if (args.workspaces) {
      if (workspaces.length === 0) {
        throw new Error('Option --workspaces provided but project is not workspaces enabled.');
      }

      glob
        .sync(`${workspaces}/`, {
          absolute: true,
          cwd: root,
          debug: this.tool.config.debug,
          strict: true,
        })
        .forEach(dir => {
          this.pipe(
            new RunCommandRoutine(path.basename(dir), command, {
              forceConfigOption: true,
              workspaceRoot: dir,
            }),
          );
        });
    } else {
      this.pipe(new RunCommandRoutine(driverName, command));
    }
  }

  execute(context: DriverContext): Promise<string[]> {
    return this.parallelizeSubroutines(null, true).then(data => {
      const response = data as SynchronizedResponse;

      if (response.errors.length > 0) {
        throw new Error('Execution failure.');
      }

      return response.results;
    });
  }
}
