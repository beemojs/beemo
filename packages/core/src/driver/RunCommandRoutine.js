/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import parseArgs from 'yargs-parser';

import type { DriverContext, Execution } from '../types';

const OPTION_PATTERN: RegExp = /-?-[-a-z0-9]+\s/gi;

export default class RunCommandRoutine extends Routine<Object, DriverContext> {
  execute(): Promise<*> {
    const { primaryDriver } = this.context;

    this.task('Filtering options', this.filterUnknownOptionsFromArgs);

    this.task('Including config option', this.includeConfigOption).skip(
      !primaryDriver.metadata.useConfigOption,
    );

    this.task('Running command', this.runCommandWithArgs);

    return this.serializeTasks();
  }

  /**
   * Filter unknown and or unsupported CLI options from the arguments passed to the CLI.
   * Utilize the driver's help option/command to determine accurate options.
   */
  filterUnknownOptionsFromArgs(): Promise<string[]> {
    const { args: commandArgs, primaryDriver: driver } = this.context;
    const { args: driverArgs, env } = driver.options;
    const args = [
      // Passed by the driver
      ...driverArgs,
      // Passed on the command line
      ...commandArgs,
      // Parallel args passed on the command line
      ...(this.config.parallelArgs || []),
    ];

    // Since we combine multiple args, we need to rebuild this.
    // And we also need to set this before we filter them.
    this.context.yargs = parseArgs(args);

    this.tool.debug('Filtering unknown command line args and options');

    return this.executeCommand(driver.metadata.bin, [driver.metadata.helpOption], { env })
      .then(({ stdout }) => {
        const nativeOptions = {};

        stdout.match(OPTION_PATTERN).forEach(option => {
          nativeOptions[option] = true;
        });

        return nativeOptions;
      })
      .then(nativeOptions => {
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

            // Extract option from assignment
            if (option.includes('=')) {
              [option] = option.split('=');
            }

            // Not a valid option, exclude
            if (!nativeOptions[option]) {
              unknownArgs.push(option);

              return;
            }

            // Check the next arg, incase the option is setting a value
            const nextArg = args[i + 1];

            if (nextArg && !nextArg.startsWith('-')) {
              skipNext = true;
              filteredArgs.push(arg, nextArg);

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
   * Include --config option if driver requires it (instead of auto-lookup resolution).
   */
  includeConfigOption(args: string[]): Promise<string[]> {
    const { configPaths, primaryDriver } = this.context;
    const configPath = configPaths.find(path => path.endsWith(primaryDriver.metadata.configName));

    if (configPath) {
      args.push(primaryDriver.metadata.configOption, configPath);
    }

    return Promise.resolve(args);
  }

  /**
   * Execute the driver's command with the filtered arguments and handle the
   * success and failures with the driver itself.
   */
  runCommandWithArgs(args: string[]): Promise<Execution> {
    const { primaryDriver: driver, yargs } = this.context;
    const options = { env: driver.options.env };

    this.tool.debug(
      `Executing command ${chalk.magenta(driver.metadata.bin)} with args "${args.join(' ')}"`,
    );

    this.tool.emit('execute-driver', [driver, args, yargs]);

    return this.executeCommand(driver.metadata.bin, args, options)
      .then(response => {
        driver.handleSuccess(response);

        this.tool.emit('successful-driver', [driver, response]);

        return response;
      })
      .catch(error => {
        driver.handleFailure(error);

        this.tool.emit('failed-driver', [driver, error]);

        throw error;
      });
  }
}
