import { EXECUTE_OPTIONS } from '../constants';
import { DriverContext } from '../contexts/DriverContext';
import { filterArgs } from '../helpers/filterArgs';
import { ExecuteCommandOptions, ExecuteCommandRoutine } from './driver/ExecuteCommandRoutine';
import { RunInWorkspacesRoutine } from './RunInWorkspacesRoutine';

export class RunDriverRoutine extends RunInWorkspacesRoutine<DriverContext> {
  pipeRoutine(context: DriverContext, packageName?: string, packageRoot?: string) {
    if (packageName) {
      this.pipeParallelBuilds(context, packageName, {
        forceConfigOption: true,
        packageRoot,
      });
    } else {
      this.pipeParallelBuilds(context, context.primaryDriver.getName());
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

    // Remove the driver name from `beemo <name>` since it
    // gets passed through and will crash the child process
    if (filteredArgv[0] === primaryDriver.getName()) {
      filteredArgv.shift();
    }

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
