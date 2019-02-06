/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './execute/RunCommandRoutine';
import BaseExecuteRoutine from './execute/BaseRoutine';

export default class ExecuteDriverRoutine extends BaseExecuteRoutine<DriverContext> {
  pipeRoutine(packageName?: string, packageRoot?: string) {
    if (packageName) {
      this.pipeParallelBuilds(packageName, {
        forceConfigOption: true,
        packageRoot,
      });
    } else {
      this.pipeParallelBuilds(this.context.primaryDriver.name);
    }
  }

  /**
   * When a parallel pipe "//" is defined, we need to create an additional routine
   * for each instance.
   */
  pipeParallelBuilds(key: string, options: Partial<RunCommandOptions> = {}) {
    const { argv, parallelArgv, primaryDriver } = this.context;
    const command = `${primaryDriver.metadata.bin} ${argv.join(' ')}`;

    this.pipe(new RunCommandRoutine(key, command, options));

    parallelArgv.forEach(pargv => {
      this.pipe(
        new RunCommandRoutine(key, `${command} ${pargv.join(' ')}`, {
          ...options,
          additionalArgv: pargv,
        }),
      );
    });
  }
}
