/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import glob from 'glob';
import isGlob from 'is-glob';
import parseArgs from 'yargs-parser';

import type { DriverContext, Execution } from '../types';

type Args = string[];

const OPTION_PATTERN: RegExp = /-?-[-a-z0-9]+(,|\s)/gi;

export default class RunCommandRoutine extends Routine<Object, DriverContext> {
  execute(): Promise<*> {
    const { metadata } = this.context.primaryDriver;

    this.task('Gathering arguments', this.gatherArgs);

    this.task('Expanding glob patterns', this.expandGlobPatterns);

    this.task('Filtering options', this.filterUnknownOptions).skip(!metadata.filterOptions);

    this.task('Including config option', this.includeConfigOption).skip(!metadata.useConfigOption);

    this.task('Running command', this.runCommandWithArgs);

    return this.serializeTasks();
  }

  /**
   * Expand arguments that look like globs.
   */
  expandGlobPatterns(args: Args): Promise<Args> {
    const nextArgs = [];

    this.tool.debug('Expanding glob patterns');

    args.forEach(arg => {
      if (isGlob(arg)) {
        const paths = glob.sync(arg, {
          cwd: this.context.root,
          debug: this.tool.config.debug,
          strict: true,
        });

        this.tool.debug(`  ${arg} ${chalk.gray('->')} ${paths.join(', ')}`);

        nextArgs.push(...paths);
      } else {
        nextArgs.push(arg);
      }
    });

    return Promise.resolve(nextArgs);
  }

  /**
   * Extract native supported options and flags from driver help output.
   */
  extractNativeOptions(): Promise<{ [option: string]: true }> {
    const driver = this.context.primaryDriver;
    const { env } = driver.options;
    const options = driver.getSupportedOptions();

    if (options.length > 0) {
      this.tool.debug('Using supported options from driver');

      const nativeOptions = {};

      options.forEach(option => {
        nativeOptions[option] = true;
      });

      return Promise.resolve(nativeOptions);
    }

    this.tool.debug('Extracting native options from help output');

    return this.executeCommand(driver.metadata.bin, [driver.metadata.helpOption], { env }).then(
      ({ stdout }) => {
        const nativeOptions = {};

        stdout.match(OPTION_PATTERN).forEach(option => {
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
  filterUnknownOptions(args: Args): Promise<Args> {
    this.tool.debug('Filtering unknown command line options');

    return this.extractNativeOptions().then(nativeOptions => {
      const filteredArgs = [];
      const unknownArgs = [];
      let skipNext = false;

      args.forEach((arg, i) => {
        if (skipNext) {
          skipNext = false;

          return;
        }

        if (arg.startsWith('-')) {
          let option = arg;
          const nextArg = args[i + 1];

          // --opt=123
          if (option.includes('=')) {
            [option] = option.split('=');

            if (!nativeOptions[option]) {
              unknownArgs.push(arg);

              return;
            }

            // --opt 123
          } else if (!nativeOptions[option]) {
            unknownArgs.push(arg);

            if (nextArg && !nextArg.startsWith('-')) {
              skipNext = true;
              unknownArgs.push(nextArg);
            }

            return;
          }
        }

        filteredArgs.push(arg);
      });

      if (unknownArgs.length > 0) {
        this.tool.debug(`Filtered args: ${unknownArgs.join(', ')}`);
      }

      return filteredArgs;
    });
  }

  /**
   * Gather arguments from all sources to pass to the driver.
   */
  gatherArgs(): Promise<Args> {
    const driverArgs = this.context.primaryDriver.getArgs();
    const commandArgs = this.context.args;
    const args = [
      // Passed by the driver
      ...driverArgs,
      // Passed on the command line
      ...commandArgs,
      // Parallel args passed on the command line
      // ...(this.config.parallelArgs || []),
    ];

    this.tool.debug('Gathering arguments to pass to driver');

    this.tool.invariant(
      driverArgs.length > 0,
      '  From driver "args" option',
      driverArgs.join(' '),
      'No arguments',
    );

    this.tool.invariant(
      commandArgs.length > 0,
      '  From the command line',
      commandArgs.join(' '),
      'No arguments',
    );

    // Since we combine multiple args, we need to rebuild this.
    // And we also need to set this before we filter them.
    this.context.yargs = parseArgs(args);

    return Promise.resolve(args);
  }

  /**
   * Include --config option if driver requires it (instead of auto-lookup resolution).
   */
  includeConfigOption(prevArgs: Args): Promise<Args> {
    const { configPaths, primaryDriver } = this.context;
    const configPath = configPaths.find(path => path.endsWith(primaryDriver.metadata.configName));
    const args = [...prevArgs];

    if (configPath) {
      args.push(primaryDriver.metadata.configOption, configPath);
    }

    this.tool.debug('Including config option to args');

    return Promise.resolve(args);
  }

  /**
   * Execute the driver's command with the filtered arguments and handle the
   * success and failures with the driver itself.
   */
  runCommandWithArgs(args: Args): Promise<Execution> {
    const driver = this.context.primaryDriver;

    this.tool.debug(
      `Executing command ${chalk.magenta(driver.metadata.bin)} with args "${args.join(' ')}"`,
    );

    this.tool.emit('before-execute', [driver, args, this.context]);

    return this.executeCommand(driver.metadata.bin, args, { env: driver.options.env })
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
