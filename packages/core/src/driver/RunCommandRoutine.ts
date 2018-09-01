/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, Task } from '@boost/core';
import chalk from 'chalk';
import glob from 'glob';
import path from 'path';
import fs from 'fs-extra';
import isGlob from 'is-glob';
import merge from 'lodash/merge';
import optimal, { array, bool, string } from 'optimal';
import parseArgs from 'yargs-parser';
import DriverContext from '../contexts/DriverContext';
import { STRATEGY_COPY } from '../constants';
import { Argv, Execution } from '../types';

const OPTION_PATTERN: RegExp = /-?-[a-z0-9-]+(,|\s)/giu;

export type OptionMap = { [option: string]: true };

export interface RunCommandOptions {
  additionalArgv: Argv;
  forceConfigOption: boolean;
  workspaceRoot: string;
}

export default class RunCommandRoutine extends Routine<DriverContext, RunCommandOptions> {
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

  execute(context: DriverContext): Promise<Execution> {
    const { forceConfigOption, workspaceRoot } = this.options;
    const { metadata } = context.primaryDriver;

    this.task('Gathering arguments', this.gatherArgs);

    this.task('Expanding glob patterns', this.expandGlobPatterns);

    this.task('Filtering options', this.filterUnknownOptions).skip(!metadata.filterOptions);

    if (workspaceRoot && metadata.workspaceStrategy === STRATEGY_COPY) {
      this.task('Copying config into workspace', this.copyConfigToWorkspace);
    } else {
      this.task('Including config option', this.includeConfigOption).skip(
        !metadata.useConfigOption && !forceConfigOption,
      );
    }

    this.task('Running command', this.runCommandWithArgs);

    return this.serializeTasks();
  }

  /**
   * When workspaces are enabled, some drivers require the config to be within each workspace,
   * instead of being referenced from the root, so we need to copy it.
   */
  copyConfigToWorkspace(context: DriverContext, argv: Argv): Promise<Argv> {
    const { workspaceRoot } = this.options;

    this.debug('Copying config files to workspace');

    context.configPaths.forEach(configPath => {
      fs.copyFileSync(configPath, path.join(workspaceRoot, path.basename(configPath)));
    });

    return Promise.resolve(argv);
  }

  /**
   * Expand arguments that look like globs.
   */
  expandGlobPatterns(context: DriverContext, argv: Argv): Promise<Argv> {
    const nextArgv: Argv = [];

    this.debug('Expanding glob patterns');

    argv.forEach(arg => {
      if (arg.charAt(0) !== '-' && isGlob(arg)) {
        const paths = glob.sync(arg, {
          cwd: context.root,
          debug: this.tool.config.debug,
          strict: true,
        });

        this.debug(
          '  %s %s %s',
          arg,
          chalk.gray('->'),
          paths.length > 0 ? paths.join(', ') : chalk.gray('(no match)'),
        );

        nextArgv.push(...paths);
      } else {
        nextArgv.push(arg);
      }
    });

    return Promise.resolve(nextArgv);
  }

  /**
   * Extract native supported options and flags from driver help output.
   */
  extractNativeOptions(): Promise<OptionMap> {
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

    return this.executeCommand(driver.metadata.bin, [driver.metadata.helpOption], { env }).then(
      ({ stdout }) => {
        const nativeOptions: OptionMap = {};
        const matches = stdout.match(OPTION_PATTERN) || [];

        matches.forEach(option => {
          // Trim trailing comma or space
          nativeOptions[option.slice(0, -1)] = true;
        });

        return nativeOptions;
      },
    );
  }

  /**
   * Filter unknown and or unsupported CLI options from the arguments passed to the CLI.
   * Utilize the driver's help option/command to determine accurate options.
   */
  filterUnknownOptions(context: DriverContext, argv: Argv): Promise<Argv> {
    this.debug('Filtering unknown command line options');

    return this.extractNativeOptions().then(nativeOptions => {
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
    });
  }

  /**
   * Gather arguments from all sources to pass to the driver.
   */
  gatherArgs(context: DriverContext): Promise<Argv> {
    this.debug('Gathering arguments to pass to driver');

    const argv = [
      // Passed by the driver
      ...this.getDriverArgs(),
      // Passed on the command line
      ...this.getCommandLineArgs(),
      // Passed with --parallel
      ...this.getAdditionalArgs(),
    ];

    // Since we combine multiple args, we need to rebuild this.
    // And we need to set this before we filter them.
    // And we need to be sure not to remove existing args.
    context.args = merge({}, parseArgs(argv), context.args);

    return Promise.resolve(argv);
  }

  /**
   * Run some validation on additional/parallel args.
   */
  getAdditionalArgs(): Argv {
    const argv = this.options.additionalArgv;

    argv.forEach(arg => {
      if (arg.includes('"') || arg.includes("'")) {
        throw new Error('--parallel option does not support nested quoted values.');
      }
    });

    this.debug.invariant(argv.length > 0, 'From --parallel option', argv.join(' '), 'No arguments');

    return argv;
  }

  /**
   * Return args from the command line.
   */
  getCommandLineArgs(): Argv {
    let { argv } = this.context;

    argv = argv.filter(arg => !arg.startsWith('--parallel'));

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
  includeConfigOption(context: DriverContext, prevArgv: Argv): Promise<Argv> {
    const { primaryDriver } = context;
    const configPath = context.findConfigByName(primaryDriver.metadata.configName);
    const argv = [...prevArgv];

    if (configPath && primaryDriver.metadata.configOption) {
      argv.push(primaryDriver.metadata.configOption, configPath);
    }

    this.debug('Including config option to args');

    return Promise.resolve(argv);
  }

  /**
   * Execute the driver's command with the filtered arguments and handle the
   * success and failures with the driver itself.
   */
  runCommandWithArgs(
    context: DriverContext,
    argv: Argv,
    task: Task<DriverContext>,
  ): Promise<Execution> {
    const driver = context.primaryDriver;
    const cwd = this.options.workspaceRoot || context.root;

    this.debug(
      'Executing command "%s %s" in %s',
      chalk.magenta(driver.metadata.bin),
      argv.join(' '),
      chalk.cyan(cwd),
    );

    this.tool.emit('before-execute', [driver, argv, context]);

    return this.executeCommand(driver.metadata.bin, argv, {
      cwd,
      env: driver.options.env,
      task,
    })
      .then(response => {
        driver.handleSuccess(response);

        this.tool.emit('after-execute', [driver, response]);

        return response;
      })
      .catch(error => {
        driver.handleFailure(error);

        this.tool.emit('failed-execute', [driver, error]);

        throw error;
      });
  }
}
