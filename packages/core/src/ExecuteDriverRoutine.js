/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import RunCommandRoutine from './driver/RunCommandRoutine';

import type { DriverContext } from './types';

export default class ExecuteDriverRoutine extends Routine<Object, DriverContext> {
  execute(): Promise<string[]> {
    const { args, primaryDriver, yargs: { parallel = [] } } = this.context;
    const driverName = primaryDriver.name;

    if (parallel.length > 0) {
      const filteredArgs = args.filter(arg => !arg.startsWith('--parallel'));

      parallel.forEach((extraArgs) => {
        const parallelArgs = extraArgs.split(' ');
        const combinedArgs = [
          ...filteredArgs,
          ...parallelArgs,
        ];

        this.pipe(new RunCommandRoutine(driverName, `${driverName} ${combinedArgs.join(' ')}`, {
          parallelArgs,
        }));
      });
    } else {
      this.pipe(new RunCommandRoutine(driverName, `${driverName} ${args.join(' ')}`));
    }

    return this.parallelizeSubroutines();
  }
}
