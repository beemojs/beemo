/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import fs from 'fs-extra';
import parseArgs from 'yargs-parser';
import Config from './execute/Config';

import type { DriverContext, ExecuteConfig, Execution } from './types';

const OPTION_PATTERN: RegExp = /-?-[-a-z0-9]+/ig;

export default class ExecuteRoutine extends Routine<ExecuteConfig, DriverContext> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * Delete all temporary config files.
   */
  deleteConfigFiles(): Promise<*[]> {
    return Promise.all(this.context.configPaths.map((configPath) => {
      this.tool.debug(`Deleting config file ${chalk.cyan(configPath)}`);

      this.tool.emit('delete-config-file', [configPath]);

      return fs.remove(configPath);
    }));
  }

  /**
   * The ExecuteRoutine handles the process of executing the driver's command
   * and correctly handling the output.
   */
  execute(): Promise<*> {
    const { primaryDriver } = this.context;
    const { cleanup } = this.config;

    this.task('Filtering options', this.filterUnknownOptionsFromArgs);

    this.task('Including config option', this.includeConfigOption)
      .skip(!primaryDriver.metadata.useConfigOption);

    this.task(`Running ${primaryDriver.metadata.bin} command`, this.runCommandWithArgs);

    this.task('Deleting temporary config files', this.deleteConfigFiles)
      .skip(!cleanup);

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
      ...driverArgs,
      ...commandArgs,
    ];

    // Set before its filtered
    this.context.argsObject = parseArgs(args);

    this.tool.debug('Filtering unknown command line args and options');

    return this.executeCommand(driver.metadata.bin, [driver.metadata.helpOption], { env })
      .then(({ stdout }) => {
        const nativeOptions = {};

        stdout.match(OPTION_PATTERN).forEach((option) => {
          nativeOptions[option] = true;
        });

        return nativeOptions;
      })
      .then((nativeOptions) => {
        const filteredArgs = [];
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

        return filteredArgs;
      });
  }

  /**
   * Include --config option if driver requires it (instead of auto-lookup resolution).
   */
  includeConfigOption(args: string[]): Promise<string[]> {
    const { configPaths, primaryDriver } = this.context;

    args.push(primaryDriver.metadata.configOption);

    const configPath = configPaths.find(path => path.endsWith(primaryDriver.metadata.configName));

    if (configPath) {
      args.push(configPath);
    }

    return Promise.resolve(args);
  }

  /**
   * Execute the driver's command with the filtered arguments and handle the
   * success and failures with the driver itself.
   */
  runCommandWithArgs(args: string[]): Promise<Execution> {
    const { argsObject, primaryDriver: driver } = this.context;
    const options = { env: driver.options.env };

    this.tool.debug(
      `Executing command ${chalk.magenta(driver.metadata.bin)} with args "${args.join(' ')}"`,
    );

    this.tool.emit('run-driver', [driver, args, argsObject]);

    return this.executeCommand(driver.metadata.bin, args, options)
      .then((response) => {
        driver.handleSuccess(response);

        this.tool.emit('successful-driver', [driver, response]);

        return response;
      })
      .catch((error) => {
        driver.handleFailure(error);

        this.tool.emit('failed-driver', [driver, error]);

        throw error;
      });
  }
}
