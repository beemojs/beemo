import DriverContext from '../contexts/DriverContext';
import ExecuteCommandRoutine, { ExecuteCommandOptions } from './driver/ExecuteCommandRoutine';
import RunInWorkspacesRoutine from './RunInWorkspacesRoutine';
import filterArgs from '../utils/filterArgs';
import { EXECUTE_OPTIONS } from '../constants';

export default class ExecuteDriverRoutine extends RunInWorkspacesRoutine<DriverContext> {
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
  pipeParallelBuilds(key: string, options: Partial<ExecuteCommandOptions> = {}) {
    const { argv, parallelArgv, primaryDriver } = this.context;
    const { filteredArgv } = filterArgs(argv, {
      block: EXECUTE_OPTIONS,
    });
    const command = `${primaryDriver.metadata.bin} ${filteredArgv.join(' ')}`.trim();

    this.pipe(
      new ExecuteCommandRoutine(key, command, {
        ...options,
        argv: filteredArgv,
      }),
    );

    parallelArgv.forEach(pargv => {
      this.pipe(
        new ExecuteCommandRoutine(key, `${command} ${pargv.join(' ')}`.trim(), {
          ...options,
          additionalArgv: pargv,
          argv: filteredArgv,
        }),
      );
    });
  }
}
