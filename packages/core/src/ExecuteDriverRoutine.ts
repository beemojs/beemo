/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine } from 'boost';
import RunCommandRoutine from './driver/RunCommandRoutine';
import { BeemoConfig, DriverContext } from './types';

export default class ExecuteDriverRoutine extends Routine<BeemoConfig, DriverContext> {
  execute(context: DriverContext): Promise<string[]> {
    const { argv, primaryDriver } = context;
    const driverName = primaryDriver.name;
    const binName = primaryDriver.metadata.bin;

    this.pipe(new RunCommandRoutine(driverName, `${binName} ${argv.join(' ')}`));

    return this.parallelizeSubroutines();
  }
}
