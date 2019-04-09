import { Routine, Task, Predicates, SignalError } from '@boost/core';
import chalk from 'chalk';
import glob from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import merge from 'lodash/merge';
import execa from 'execa';
import parseArgs from 'yargs-parser';
import Beemo from '../Beemo';
import DriverContext from '../contexts/DriverContext';
import BatchStream from '../streams/BatchStream';
import filterArgs, { OptionMap } from '../utils/filterArgs';
import { STRATEGY_COPY } from '../constants';
import { Argv, Execution } from '../types';

const OPTION_PATTERN: RegExp = /-?-[a-z0-9-]+(,|\s)/giu;

export interface RunCommandOptions {
  additionalArgv?: Argv;
  argv?: Argv;
  forceConfigOption?: boolean;
  packageRoot?: string;
}

export default class RunCommandRoutine extends Routine<DriverContext, Beemo, RunCommandOptions> {
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

    this.task(tool.msg('app:driverRunGatherArgs'), this.gatherArgs);

    this.task(tool.msg('app:driverRunExpandGlob'), this.expandGlobPatterns);

    this.task(tool.msg('app:driverRunFilterOptions'), this.filterUnknownOptions).skip(
      !metadata.filterOptions,
    );

    if (packageRoot && metadata.workspaceStrategy === STRATEGY_COPY) {
      this.task(tool.msg('app:driverRunCopyWorkspaceConfig'), this.copyConfigToWorkspacePackage);
    } else {
      this.task(tool.msg('app:driverRunIncludeConfigOption'), this.includeConfigOption).skip(
        !metadata.useConfigOption && !forceConfigOption,
      );
    }

    this.task(tool.msg('app:driverRunCommand'), this.runCommandWithArgs);
  }

  /**
   * Capture live output via `--live` or `--watch`. Buffer the output incase ctrl+c is entered.
   */
  captureLiveOutput = (stream: execa.ExecaChildProcess) => {
    const { args, primaryDriver } = this.context;
    const { watchOptions } = primaryDriver.metadata;
    const isWatching = watchOptions.some(option => {
      // Option
      if (option.startsWith('-')) {
        return !!args[option.replace(/^-{1,2}/u, '')];
      }

      // Argument
      return args._.includes(option);
    });

    if (isWatching) {
      const handler = (chunk: Buffer) => {
        process.stdout.write(String(chunk));
      };

      stream.stdout!.pipe(new BatchStream({ wait: 1000 })).on('data', handler);
      stream.stderr!.pipe(new BatchStream({ wait: 1000 })).on('data', handler);

      return 'watch';
    }

    let buffer = '';

    // When cmd/ctrl + c is pressed, write out the current buffer
    if (!args.live) {
      this.tool.console.on('error', error => {
        if (
          error instanceof SignalError &&
          (error.signal === 'SIGINT' || error.signal === 'SIGTERM')
        ) {
          process.stdout.write(chalk.gray(this.tool.msg('app:signalBufferMessage')));
          process.stdout.write(`\n\n${buffer}`);
        }
      });
    }

    const handler = (chunk: Buffer) => {
      if (args.live) {
        process.stdout.write(String(chunk));
      } else {
        buffer += String(chunk);
      }
    };

    stream.stdout!.on('data', handler);
    stream.stderr!.on('data', handler);

    return args.live ? 'live' : 'buffer';
  };

  /**
   * When workspaces are enabled, some drivers require the config to be within each workspace,
   * instead of being referenced from the root, so we need to copy it.
   */
  async copyConfigToWorkspacePackage(context: DriverContext, argv: Argv): Promise<Argv> {
    const { packageRoot } = this.options;

    this.debug('Copying config files to workspace');

    context.configPaths.forEach(config => {
      fs.copyFileSync(config.path, path.join(packageRoot, path.basename(config.path)));
    });

    return argv;
  }

  /**
   * Expand arguments that look like globs.
   */
  async expandGlobPatterns(context: DriverContext, argv: Argv): Promise<Argv> {
    const nextArgv: Argv = [];

    this.debug('Expanding glob patterns');

    argv.forEach(arg => {
      if (arg.charAt(0) !== '-' && isGlob(arg)) {
        const paths = glob
          .sync(arg, {
            cwd: context.cwd,
            onlyDirectories: false,
            onlyFiles: false,
          })
          .map(filePath => String(filePath));

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

      options.forEach(option => {
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

    matches.forEach(option => {
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
  async gatherArgs(context: DriverContext): Promise<Argv> {
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
  async includeConfigOption(context: DriverContext, prevArgv: Argv): Promise<Argv> {
    const { primaryDriver } = context;
    const configPath = context.findConfigByName(primaryDriver.metadata.configName);
    const argv = [...prevArgv];

    if (configPath && primaryDriver.metadata.configOption) {
      argv.push(primaryDriver.metadata.configOption, configPath.path);
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
    const cwd = this.options.packageRoot || context.cwd;
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
        wrap: this.captureLiveOutput,
      });

      driver.handleSuccess(result);

      await driver.onAfterExecute.emit([context, result]);
    } catch (error) {
      if (error.name !== 'MaxBufferError') {
        driver.handleFailure(error);
      }

      await driver.onFailedExecute.emit([context, error]);

      throw new Error((driver.extractErrorMessage(error) || '').trim());
    }

    return result;
  }
}
