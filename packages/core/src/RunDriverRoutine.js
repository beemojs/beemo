/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
// import parseArgs from 'yargs-parser';
import ExecuteRoutine from './execute/ExecuteRoutine';

import type { DriverContext } from './types';

export default class RunDriverRoutine extends Routine<Object, DriverContext> {
  execute(): Promise<string[]> {
    const { primaryDriver, yargs } = this.context;
    const { parallel = [] } = yargs;
    const driverName = primaryDriver.name;

    if (parallel.length > 0) {
      parallel.forEach((args) => {
        this.pipe(new ExecuteRoutine(driverName, `${driverName} ${args}`, {
          parallelArgs: args.split(' '),
        }));
      });
    } else {
      this.pipe(new ExecuteRoutine(driverName, driverName));
    }

    return this.parallelizeSubroutines();
  }
}
