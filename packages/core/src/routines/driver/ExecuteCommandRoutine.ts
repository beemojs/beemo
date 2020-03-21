import { Path } from '@boost/common';
import { Routine, Task, Predicates, SignalError, ExitError } from '@boost/core';
import chalk from 'chalk';
import glob from 'fast-glob';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import merge from 'lodash/merge';
import execa from 'execa';
import parseArgs from 'yargs-parser';
import Beemo from '../../Beemo';
import DriverContext from '../../contexts/DriverContext';
import BatchStream from '../../streams/BatchStream';
import formatExecReturn from '../../utils/formatExecReturn';
import filterArgs, { OptionMap } from '../../utils/filterArgs';
import { STRATEGY_COPY } from '../../constants';
import { Argv, Execution } from '../../types';

const OPTION_PATTERN = /-?-[a-z0-9-]+(,|\s)/giu;

export interface ExecuteCommandOptions {
  additionalArgv?: Argv;
  argv?: Argv;
  forceConfigOption?: boolean;
  packageRoot?: string;
}

export default class ExecuteCommandRoutine extends Routine<
  DriverContext,
  Beemo,
  ExecuteCommandOptions
> {
  blueprint({ array, bool, string }: Predicates) /* infer */ {
    return {
      additionalArgv: array(string()),
      argv: array(string()),
      forceConfigOption: bool(),
      packageRoot: string(),
    };
  }

  bootstrap() {
    const { tool } = this;
    const { forceConfigOption, packageRoot } = this.options;
    const { metadata } = this.context.primaryDriver;

    this.task(tool.msg('app:driverExecuteGatherArgs'), this.gatherArgs);

    this.task(tool.msg('app:driverExecuteExpandGlob'), this.expandGlobPatterns);

    this.task(tool.msg('app:driverExecuteFilterOptions'), this.filterUnknownOptions).skip(
      !metadata.filterOptions,
    );

    if (packageRoot && metadata.workspaceStrategy === STRATEGY_COPY) {
      this.task(
        tool.msg('app:driverExecuteCopyWorkspaceConfig'),
        this.copyConfigToWorkspacePackage,
      );
    } else {
      this.task(tool.msg('app:driverExecuteIncludeConfigOption'), this.includeConfigOption).skip(
        !metadata.useConfigOption && !forceConfigOption,
      );
    }

    this.task(tool.msg('app:driverExecute'), this.runCommandWithArgs);
  }

  /**
   * Capture live output via `--stdio=pipe` or `--watch`. Buffer the output incase ctrl+c is entered.
   */
  captureOutput = (stream: execa.ExecaChildProcess) => {
    const { args, primaryDriver } = this.context;
    const { watchOptions } = primaryDriver.metadata;
    const isWatching = watchOptions.some((option) => {
      // Option
      if (option.startsWith('-')) {
        return !!args[option.replace(/^-{1,2}/u, '')];
      }

      // Argument
      return args._.includes(option);
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

    let buffer = '';

    // When cmd/ctrl + c is pressed, write out the current buffer
    if (args.stdio === 'buffer') {
      this.tool.console.onError.listen((error) => {
        if (
          (error instanceof SignalError || error.name === 'SignalError') &&
          // @ts-ignore Temporary fix
          (error.signal === 'SIGINT' || error.signal === 'SIGTERM')
        ) {
          process.stdout.write(chalk.gray(this.tool.msg('app:signalBufferMessage')));
          process.stdout.write(`\n\n${buffer}`);
        }
      });
    }

    // When streaming or inheriting, output immediately,
    // otherwise buffer for the reporter.
    const handler = (chunk: Buffer) => {
      if (args.stdio === 'stream' || args.stdio === 'inherit') {
        process.stdout.write(String(chunk));
      } else {
        buffer += String(chunk);
      }
    };

    stream.stdout!.on('data', handler);
    stream.stderr!.on('data', handler);

    return args.stdio || 'buffer';
  };

  /**
   * When workspaces are enabled, some drivers require the config to be within each workspace,
   * instead of being referenced from the root, so we need to copy it.
   */
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
          chalk.gray('->'),
          paths.length > 0 ? paths.join(', ') : chalk.gray(this.tool.msg('app:noMatch')),
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
  async extractNativeOptions(): Promise<OptionMap> {
    const driver = this.context.primaryDriver;
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
  async filterUnknownOptions(context: DriverContext, argv: Argv): Promise<Argv> {
    this.debug('Filtering unknown command line options');

    const nativeOptions = await this.extractNativeOptions();
    const { filteredArgv, unknownArgv } = filterArgs(argv, {
      allow: nativeOptions,
    });

    if (unknownArgv.length > 0) {
      this.debug('Filtered args: %s', chalk.gray(unknownArgv.join(', ')));
    }

    return filteredArgv;
  }

  /**
   * Gather arguments from all sources to pass to the driver.
   */
  gatherArgs(context: DriverContext): Argv {
    this.debug('Gathering arguments to pass to driver');

    const argv = [
      // Passed by the driver
      ...this.getDriverArgs(),
      // Passed on the command line
      ...this.getCommandLineArgs(),
      // Passed with parallel "//" operator
      ...this.getAdditionalArgs(),
    ];

    // Since we combine multiple args, we need to rebuild this.
    // And we need to set this before we filter them.
    // And we need to be sure not to remove existing args.
    context.args = merge({}, parseArgs(argv), context.args);

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
  getDriverArgs(): Argv {
    const argv = this.context.primaryDriver.getArgs();

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
  async runCommandWithArgs(
    context: DriverContext,
    argv: Argv,
    task: Task<DriverContext>,
  ): Promise<Execution> {
    const driver = context.primaryDriver;
    const cwd = String(this.options.packageRoot || context.cwd);
    let result = null;

    this.debug(
      'Executing command "%s %s" in %s',
      chalk.magenta(driver.metadata.bin),
      argv.join(' '),
      chalk.cyan(cwd),
    );

    await driver.onBeforeExecute.emit([context, argv]);

    try {
      result = await this.executeCommand(driver.metadata.bin, argv, {
        cwd,
        env: driver.options.env,
        task,
        wrap: this.captureOutput,
      });

      this.debug('  Success: %o', formatExecReturn(result));

      driver.processSuccess(result);

      await driver.onAfterExecute.emit([context, result]);
    } catch (error) {
      result = error as execa.ExecaError;

      this.debug('  Failure: %o', formatExecReturn(result));
      this.debug('  Error message: %s', chalk.gray(result.message));

      if (result.name !== 'MaxBufferError') {
        driver.processFailure(result);
      }

      await driver.onFailedExecute.emit([context, result]);

      // Throw a new formatted error with the old stack trace
      let newError: ExitError;

      // https://nodejs.org/api/child_process.html#child_process_event_exit
      if (result.exitCode === null && result.signal === 'SIGKILL') {
        newError = new ExitError('Out of memory!', 1);
      } else {
        newError = new ExitError((driver.extractErrorMessage(result) || '').trim(), error.exitCode);
      }

      if (error.stack) {
        newError.stack = error.stack;
      }

      throw newError;
    }

    return result;
  }
}
