/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import RunCommandRoutine from './driver/RunCommandRoutine';

import type { BeemoConfig, DriverContext } from './types';

export default class ExecuteDriverRoutine extends Routine<BeemoConfig, DriverContext> {
  execute(context: DriverContext): Promise<string[]> {
    const { args, primaryDriver } = context;
    const driverName = primaryDriver.name;
    const binName = primaryDriver.metadata.bin;

    // if (parallel.length > 0) {
    //   const filteredArgs = args.filter(arg => !arg.startsWith('--parallel'));
    //
    //   parallel.forEach(extraArgs => {
    //     const parallelArgs = extraArgs.split(' ');
    //     const combinedArgs = [...filteredArgs, ...parallelArgs];
    //
    //     this.pipe(
    //       new RunCommandRoutine(driverName, `${binName} ${combinedArgs.join(' ')}`, {
    //         parallelArgs,
    //       }),
    //     );
    //   });
    // } else {
    this.pipe(new RunCommandRoutine(driverName, `${binName} ${args.join(' ')}`));
    // }

    return this.parallelizeSubroutines();
  }
}
