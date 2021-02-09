import DriverContext from '../contexts/DriverContext';
import ExecuteCommandRoutine, { ExecuteCommandOptions } from './driver/ExecuteCommandRoutine';
import RunInWorkspacesRoutine from './RunInWorkspacesRoutine';
import filterArgs from '../helpers/filterArgs';
import { EXECUTE_OPTIONS } from '../constants';

export default class ExecuteDriverRoutine extends RunInWorkspacesRoutine<DriverContext> {
  pipeRoutine(context: DriverContext, packageName?: string, packageRoot?: string) {
    if (packageName) {
      this.pipeParallelBuilds(context, packageName, {
        forceConfigOption: true,
        packageRoot,
      });
    } else {
      this.pipeParallelBuilds(context, context.primaryDriver.name);
    }
  }

  /**
   * When a parallel pipe "//" is defined, we need to create an additional routine
   * for each instance.
   */
  pipeParallelBuilds(
    context: DriverContext,
    key: string,
    options: Partial<ExecuteCommandOptions> = {},
  ) {
    const { argv, parallelArgv, primaryDriver } = context;
    const { filteredArgv } = filterArgs(argv, {
      block: EXECUTE_OPTIONS,
    });
    const command = `${primaryDriver.metadata.bin} ${filteredArgv.join(' ')}`.trim();

    this.routines.push(
      new ExecuteCommandRoutine(key, command, {
        ...options,
        argv: filteredArgv,
        tool: this.options.tool,
      }),
    );

    parallelArgv.forEach((pargv) => {
      this.routines.push(
        new ExecuteCommandRoutine(key, `${command} ${pargv.join(' ')}`.trim(), {
          ...options,
          additionalArgv: pargv,
          argv: filteredArgv,
          tool: this.options.tool,
        }),
      );
    });
  }
}
