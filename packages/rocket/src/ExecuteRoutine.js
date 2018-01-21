/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs-extra';
import { Routine } from 'boost';
import Config from './execute/Config';

import type { ExecuteConfig, Execution, RocketContext } from './types';

const OPTION_PATTERN: RegExp = /-?-[-a-z0-9]+/ig;

export default class ExecuteRoutine extends Routine<ExecuteConfig, RocketContext> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * Delete all temporary config files.
   */
  deleteConfigFiles(): Promise<*[]> {
    return Promise.all(this.context.configPaths.map(configPath => {
      this.tool.emit('delete-config', null, [configPath]);

      fs.remove(configPath);
    }));
  }

  /**
   * The ExecuteRoutine handles the process of executing the engine's command
   * and correctly handling the output.
   */
  execute(): Promise<*> {
    const { primaryEngine } = this.context;
    const { cleanup } = this.config;

    this.task('Filtering options', this.filterUnknownOptionsFromArgs);
    this.task(`Running ${primaryEngine.metadata.bin} command`, this.runCommandWithArgs);
    this.task('Deleting temporary config files', this.deleteConfigFiles).skip(!cleanup);

    return this.serializeTasks();
  }

  /**
   * Filter unknown and or unsupported CLI options from the arguments passed to the CLI.
   * Utilize the engine's help option/command to determine accurate options.
   */
  filterUnknownOptionsFromArgs(): Promise<string[]> {
    const { args, primaryEngine: engine } = this.context;
    const options = { env: engine.options.env };

    return this.executeCommand(engine.metadata.bin, [engine.metadata.helpOption], options)
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
   * Execute the engine's command with the filtered arguments and handle the
   * success and failures with the engine itself.
   */
  runCommandWithArgs(args: string[]): Promise<Execution> {
    const { primaryEngine: engine } = this.context;
    const options = { env: engine.options.env };

    this.tool.emit('execute', null, [engine, args]);

    return this.executeCommand(engine.metadata.bin, args, options)
      .then((response) => {
        engine.handleSuccess(response);

        this.tool.emit('successful-execute', null, [engine, response]);

        return response;
      })
      .catch((error) => {
        engine.handleFailure(error);

        this.tool.emit('failed-execute', null, [engine, error]);

        throw error;
      });
  }
}
