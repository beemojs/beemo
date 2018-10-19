/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, Task } from '@boost/core';
import chalk from 'chalk';
import glob from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import merge from 'lodash/merge';
import optimal, { array, bool, string } from 'optimal';
import parseArgs from 'yargs-parser';
import DriverContext from '../contexts/DriverContext';
import { STRATEGY_COPY } from '../constants';
import { Argv, Execution, BeemoTool } from '../types';

const OPTION_PATTERN: RegExp = /-?-[a-z0-9-]+(,|\s)/giu;

export type OptionMap = { [option: string]: true };

export interface RunCommandOptions {
  additionalArgv: Argv;
  forceConfigOption: boolean;
  workspaceRoot: string;
}

export default class RunCommandRoutine extends Routine<
  DriverContext,
  BeemoTool,
  RunCommandOptions
> {
  bootstrap() {
    this.options = optimal(
      this.options,
      {
        additionalArgv: array(string()),
        forceConfigOption: bool(),
        workspaceRoot: string().empty(),
      },
      {
        name: 'RunCommandRoutine',
      },
    );
  }

  async execute(context: DriverContext): Promise<Execution> {
    const { tool } = this;
    const { forceConfigOption, workspaceRoot } = this.options;
    const { metadata } = context.primaryDriver;

    this.task(tool.msg('app:driverRunGatherArgs'), this.gatherArgs);

    this.task(tool.msg('app:driverRunExpandGlob'), this.expandGlobPatterns);

    this.task(tool.msg('app:driverRunFilterOptions'), this.filterUnknownOptions).skip(
      !metadata.filterOptions,
    );

    if (workspaceRoot && metadata.workspaceStrategy === STRATEGY_COPY) {
      this.task(tool.msg('app:driverRunCopyWorkspaceConfig'), this.copyConfigToWorkspace);
    } else {
      this.task(tool.msg('app:driverRunIncludeConfigOption'), this.includeConfigOption).skip(
        !metadata.useConfigOption && !forceConfigOption,
      );
    }

    this.task(tool.msg('app:driverRunCommand'), this.runCommandWithArgs);

    return this.serializeTasks();
  }

  /**
   * When workspaces are enabled, some drivers require the config to be within each workspace,
   * instead of being referenced from the root, so we need to copy it.
   */
  async copyConfigToWorkspace(context: DriverContext, argv: Argv): Promise<Argv> {
    const { workspaceRoot } = this.options;

    this.debug('Copying config files to workspace');

    context.configPaths.forEach(config => {
      fs.copyFileSync(config.path, path.join(workspaceRoot, path.basename(config.path)));
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
            cwd: context.root,
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
    const filteredArgv: Argv = [];
    const unknownArgv: Argv = [];
    let skipNext = false;

    argv.forEach((arg, i) => {
      if (skipNext) {
        skipNext = false;

        return;
      }

      if (arg.startsWith('-')) {
        let option = arg;
        const nextArg = argv[i + 1];

        // --opt=123
        if (option.includes('=')) {
          [option] = option.split('=');

          if (!nativeOptions[option]) {
            unknownArgv.push(arg);

            return;
          }

          // --opt 123
        } else if (!nativeOptions[option]) {
          unknownArgv.push(arg);

          if (nextArg && !nextArg.startsWith('-')) {
            skipNext = true;
            unknownArgv.push(nextArg);
          }

          return;
        }
      }

      filteredArgv.push(arg);
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
    const { argv } = this.context;

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
    const cwd = this.options.workspaceRoot || context.root;
    let result = null;

    this.debug(
      'Executing command "%s %s" in %s',
      chalk.magenta(driver.metadata.bin),
      argv.join(' '),
      chalk.cyan(cwd),
    );

    this.tool.emit(`${driver.name}.before-execute`, [context, argv, driver]);

    try {
      result = await this.executeCommand(driver.metadata.bin, argv, {
        cwd,
        env: driver.options.env,
        task,
      });

      driver.handleSuccess(result);

      this.tool.emit(`${driver.name}.after-execute`, [context, result, driver]);
    } catch (error) {
      driver.handleFailure(error);

      this.tool.emit(`${driver.name}.failed-execute`, [context, error, driver]);

      throw error;
    }

    return result;
  }
}
