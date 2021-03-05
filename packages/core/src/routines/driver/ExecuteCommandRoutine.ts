/* eslint-disable @typescript-eslint/member-ordering */

import execa, { ExecaError } from 'execa';
import glob from 'fast-glob';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import merge from 'lodash/merge';
import { parse } from '@boost/args';
import { Bind, Blueprint, ExitError, Path, Predicates } from '@boost/common';
import { color } from '@boost/internal';
import { AnyWorkUnit, Routine, WaterfallPipeline } from '@boost/pipeline';
import { STRATEGY_COPY } from '../../constants';
import DriverContext from '../../contexts/DriverContext';
import filterArgs, { OptionMap } from '../../helpers/filterArgs';
import formatExecReturn from '../../helpers/formatExecReturn';
import BatchStream from '../../streams/BatchStream';
import type Tool from '../../Tool';
import { Argv, Execution, RoutineOptions } from '../../types';

const OPTION_PATTERN = /-?-[a-z0-9-]+(,|\s)/giu;

export interface ExecuteCommandOptions extends RoutineOptions {
  additionalArgv?: Argv;
  argv?: Argv;
  forceConfigOption?: boolean;
  packageRoot?: string;
}

export default class ExecuteCommandRoutine extends Routine<
  unknown,
  unknown,
  ExecuteCommandOptions
> {
  blueprint({ array, bool, instance, string }: Predicates): Blueprint<ExecuteCommandOptions> {
    return {
      additionalArgv: array(string()),
      argv: array(string()),
      forceConfigOption: bool(),
      packageRoot: string(),
      tool: instance<Tool>().required().notNullable(),
    };
  }

  execute(context: DriverContext) {
    const { tool } = this.options;
    const { forceConfigOption, packageRoot } = this.options;
    const { metadata, options } = context.primaryDriver;

    let pipeline = new WaterfallPipeline(context).pipe(
      tool.msg('app:driverExecuteGatherArgs'),
      this.gatherArgs,
    );

    if (options.expandGlobs) {
      pipeline = pipeline.pipe(tool.msg('app:driverExecuteExpandGlob'), this.expandGlobPatterns);
    }

    if (metadata.filterOptions) {
      pipeline = pipeline.pipe(
        tool.msg('app:driverExecuteFilterOptions'),
        this.filterUnknownOptions,
      );
    }

    if (packageRoot && metadata.workspaceStrategy === STRATEGY_COPY) {
      pipeline = pipeline.pipe(
        tool.msg('app:driverExecuteCopyWorkspaceConfig'),
        this.copyConfigToWorkspacePackage,
      );
    } else if (metadata.useConfigOption || forceConfigOption) {
      pipeline = pipeline.pipe(
        tool.msg('app:driverExecuteIncludeConfigOption'),
        this.includeConfigOption,
      );
    }

    return pipeline.pipe(tool.msg('app:driverExecute'), this.runCommandWithArgs).run();
  }

  /**
   * Capture live output via `--stdio=pipe` or `--watch`.
   */
  @Bind()
  captureOutput(context: DriverContext, stream: execa.ExecaChildProcess) {
    const { args, primaryDriver } = context;
    const { watchOptions } = primaryDriver.metadata;
    const isWatching = watchOptions.some((option) => {
      // Option
      if (option.startsWith('-')) {
        const name = option.replace(/^-{1,2}/u, '');

        // @ts-expect-error Allow this
        return !!(args.options[name] || args.unknown[name]);
      }

      // Param
      return args.params.includes(option);
    });

    if (isWatching) {
      const wait = 1000;
      const handler = (chunk: Buffer) => {
        process.stdout.write(String(chunk));
      };

      stream.stdout!.pipe(new BatchStream({ wait })).on('data', handler);
      stream.stderr!.pipe(new BatchStream({ wait })).on('data', handler);

      return 'watch';
    }

    // When streaming or inheriting, output immediately, otherwise swallow.
    const { stdio } = args.options;

    const handler = (chunk: Buffer) => {
      if (stdio === 'stream' || stdio === 'inherit') {
        process.stdout.write(String(chunk));
      }
    };

    stream.stdout!.on('data', handler);
    stream.stderr!.on('data', handler);

    return stdio || 'buffer';
  }

  /**
   * When workspaces are enabled, some drivers require the config to be within each workspace,
   * instead of being referenced from the root, so we need to copy it.
   */
  @Bind()
  copyConfigToWorkspacePackage(context: DriverContext, argv: Argv): Argv {
    const { packageRoot } = this.options;

    this.debug('Copying config files to workspace');

    context.configPaths.forEach((config) => {
      fs.copyFileSync(config.path.path(), new Path(packageRoot, config.path.name()).path());
    });

    return argv;
  }

  /**
   * Expand arguments that look like globs.
   */
  @Bind()
  expandGlobPatterns(context: DriverContext, argv: Argv): Argv {
    const nextArgv: Argv = [];

    this.debug('Expanding glob patterns');

    argv.forEach((arg) => {
      if (arg.charAt(0) !== '-' && isGlob(arg)) {
        const paths = glob
          .sync(arg, {
            cwd: String(context.cwd),
            onlyDirectories: false,
            onlyFiles: false,
          })
          .map((path) => new Path(path).path());

        this.debug(
          '  %s %s %s',
          arg,
          color.mute('->'),
          paths.length > 0 ? paths.join(', ') : color.mute(this.options.tool.msg('app:noMatch')),
        );

        nextArgv.push(...paths);
      } else {
        nextArgv.push(arg);
      }
    });

    return nextArgv;
  }

  /**
   * Extract native supported options and flags from driver help output.
   */
  async extractNativeOptions(context: DriverContext): Promise<OptionMap> {
    const driver = context.primaryDriver;
    const { env } = driver.options;
    const options = driver.getSupportedOptions();

    if (options.length > 0) {
      this.debug('Using supported options from driver');

      const nativeOptions: OptionMap = {};

      options.forEach((option) => {
        nativeOptions[option] = true;
      });

      return Promise.resolve(nativeOptions);
    }

    this.debug('Extracting native options from help output');

    const { stdout } = await this.executeCommand(
      driver.metadata.bin,
      driver.metadata.helpOption.split(' '),
      {
        env,
      },
    );

    const nativeOptions: OptionMap = {};
    const matches = stdout.match(OPTION_PATTERN) || [];

    matches.forEach((option) => {
      // Trim trailing comma or space
      nativeOptions[option.slice(0, -1)] = true;
    });

    return nativeOptions;
  }

  /**
   * Filter unknown and or unsupported CLI options from the arguments passed to the CLI.
   * Utilize the driver's help option/command to determine accurate options.
   */
  @Bind()
  async filterUnknownOptions(context: DriverContext, argv: Argv): Promise<Argv> {
    this.debug('Filtering unknown command line options');

    const nativeOptions = await this.extractNativeOptions(context);
    const { filteredArgv, unknownArgv } = filterArgs(argv, {
      allow: nativeOptions,
    });

    if (unknownArgv.length > 0) {
      this.debug('Filtered args: %s', color.mute(unknownArgv.join(', ')));
    }

    return filteredArgv;
  }

  /**
   * Gather arguments from all sources to pass to the driver.
   */
  @Bind()
  gatherArgs(context: DriverContext): Argv {
    this.debug('Gathering arguments to pass to driver');

    const argv = [
      // Passed by the driver
      ...this.getDriverArgs(context),
      // Passed on the command line
      ...this.getCommandLineArgs(),
      // Passed with parallel "//" operator
      ...this.getAdditionalArgs(),
    ];

    // Since we combine multiple args, we need to rebuild this.
    // And we need to set this before we filter them.
    // And we need to be sure not to remove existing args.
    context.args = merge(
      {},
      parse(argv, {
        loose: true,
        options: {},
      }),
      context.args,
    );

    return argv;
  }

  /**
   * Run some validation on additional/parallel args.
   */
  getAdditionalArgs(): Argv {
    const argv = this.options.additionalArgv;

    this.debug.invariant(argv.length > 0, 'From parallel operator', argv.join(' '), 'No arguments');

    return argv;
  }

  /**
   * Return args from the command line.
   */
  getCommandLineArgs(): Argv {
    const { argv } = this.options;

    this.debug.invariant(argv.length > 0, 'From the command line', argv.join(' '), 'No arguments');

    return argv;
  }

  /**
   * Return args from the primary driver.
   */
  getDriverArgs(context: DriverContext): Argv {
    const argv = context.primaryDriver.getArgs();

    this.debug.invariant(
      argv.length > 0,
      'From driver "args" option',
      argv.join(' '),
      'No arguments',
    );

    return argv;
  }

  /**
   * Include --config option if driver requires it (instead of auto-lookup resolution).
   */
  @Bind()
  includeConfigOption(context: DriverContext, prevArgv: Argv): Argv {
    const { primaryDriver } = context;
    const configPath = context.findConfigByName(primaryDriver.metadata.configName);
    const argv = [...prevArgv];

    if (configPath && primaryDriver.metadata.configOption) {
      argv.push(primaryDriver.metadata.configOption, configPath.path.path());
    }

    this.debug('Including config option to args');

    return argv;
  }

  /**
   * Execute the driver's command with the filtered arguments and handle the
   * success and failures with the driver itself.
   */
  @Bind()
  async runCommandWithArgs(
    context: DriverContext,
    argv: Argv,
    workUnit?: AnyWorkUnit,
  ): Promise<Execution> {
    const driver = context.primaryDriver;
    const cwd = String(this.options.packageRoot || context.cwd);

    this.debug(
      'Executing command "%s %s" in %s',
      color.symbol(driver.metadata.bin),
      argv.join(' '),
      color.filePath(cwd),
    );

    await driver.onBeforeExecute.emit([context, argv]);

    try {
      const result = await this.executeCommand(driver.metadata.bin, argv, {
        cwd,
        env: driver.options.env,
        workUnit,
        wrap: (stream) => this.captureOutput(context, stream),
      });

      this.debug('  Success: %o', formatExecReturn(result));

      driver.processSuccess(result);

      await driver.onAfterExecute.emit([context, result]);

      return result;
    } catch (error) {
      const result = error as ExecaError;

      this.debug('  Failure: %o', formatExecReturn(result));
      this.debug('  Error message: %s', color.fail(result.message));

      if (result.name !== 'MaxBufferError') {
        driver.processFailure(result);

        // TODO: Remove this temporary output once the CLI is finished
        if (driver.output.stdout) {
          console.log(driver.output.stdout);
        }

        if (driver.output.stderr) {
          console.error(driver.output.stderr);
        }
      }

      await driver.onFailedExecute.emit([context, result]);

      // https://nodejs.org/api/child_process.html#child_process_event_exit
      throw result.exitCode === null && result.signal === 'SIGKILL'
        ? new ExitError('Out of memory!', 1)
        : new ExitError((driver.extractErrorMessage(result) || '').trim(), error.exitCode);
    }
  }
}
