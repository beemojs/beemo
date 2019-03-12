import DriverContext from './contexts/DriverContext';
import RunCommandRoutine, { RunCommandOptions } from './execute/RunCommandRoutine';
import BaseExecuteRoutine from './execute/BaseRoutine';
import filterArgs from './utils/filterArgs';
import { EXECUTE_OPTIONS } from './constants';

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
    const { filteredArgv } = filterArgs(argv, {
      block: EXECUTE_OPTIONS,
    });
    const command = `${primaryDriver.metadata.bin} ${filteredArgv.join(' ')}`.trim();

    this.pipe(
      new RunCommandRoutine(key, command, {
        ...options,
        argv: filteredArgv,
      }),
    );

    parallelArgv.forEach(pargv => {
      this.pipe(
        new RunCommandRoutine(key, `${command} ${pargv.join(' ')}`.trim(), {
          ...options,
          additionalArgv: pargv,
          argv: filteredArgv,
        }),
      );
    });
  }
}
