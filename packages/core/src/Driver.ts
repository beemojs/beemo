/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Plugin, EventListener } from '@boost/core';
import mergeWith from 'lodash/mergeWith';
import optimal, { array, bool, number, object, string, union, Blueprint } from 'optimal';
import DriverContext from './contexts/DriverContext';
import { STRATEGY_COPY, STRATEGY_CREATE, STRATEGY_REFERENCE, STRATEGY_NATIVE } from './constants';
import { Argv, DriverCommandOptions, DriverOptions, DriverMetadata, Execution } from './types';

export default class Driver<Config = any> extends Plugin<DriverOptions> {
  command: DriverCommandOptions = {};

  // @ts-ignore Set after instantiation
  config: Config;

  // @ts-ignore Set after instantiation
  context: DriverContext;

  // @ts-ignore Set after instantiation
  metadata: DriverMetadata;

  constructor(options: Partial<DriverOptions> = {}) {
    super(options);

    this.options = optimal(
      options,
      {
        args: array(string()),
        dependencies: array(string()),
        env: object(union([bool(), number(), string()])),
        strategy: string(STRATEGY_NATIVE).oneOf([
          STRATEGY_NATIVE,
          STRATEGY_CREATE,
          STRATEGY_REFERENCE,
          STRATEGY_COPY,
        ]),
      },
      {
        name: this.constructor.name,
      },
    );
  }

  /**
   * Format the configuration file before it's written.
   */
  formatConfig(data: Config): string {
    const content = JSON.stringify(data, null, 2);

    if (this.metadata.configName.endsWith('.js')) {
      return `module.exports = ${content};`;
    }

    return content;
  }

  /**
   * Return a list of user defined arguments.
   */
  getArgs(): Argv {
    return [...this.options.args];
  }

  /**
   * Return a list of dependent drivers.
   */
  getDependencies(): string[] {
    return [
      // Always required; configured by the driver
      ...this.metadata.dependencies,
      // Custom; configured by the consumer
      ...this.options.dependencies,
    ];
  }

  /**
   * Return a list of supported CLI options.
   */
  getSupportedOptions(): string[] {
    return [];
  }

  /**
   * Handle command failures according to this driver.
   */
  handleFailure(error: Execution) {
    const { stderr, stdout } = error;
    const out = (stderr || stdout).trim();

    // Integration debugging
    // this.tool.logError('STDERR', JSON.stringify(error));

    if (out) {
      this.tool.logError(out);
    }
  }

  /**
   * Handle successful commands according to this driver.
   */
  handleSuccess(response: Execution) {
    const out = response.stdout.trim();

    // Integration debugging
    // this.tool.log('STDOUT', JSON.stringify(response));

    if (out) {
      this.tool.log(out);
    }
  }

  /**
   * Special case for merging arrays.
   */
  handleMerge(prevValue: any, nextValue: any): any {
    if (Array.isArray(prevValue)) {
      return prevValue.concat(nextValue);
    }

    return undefined;
  }

  /**
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: Config, next: Config): Config {
    return mergeWith(prev, next, this.handleMerge);
  }

  /**
   * Easily register events in the tool.
   */
  on(eventName: string, listener: EventListener): this {
    this.tool.on(eventName, listener);

    return this;
  }

  /**
   * Setup additional command options.
   */
  setCommandOptions(options: DriverCommandOptions): this {
    const blueprint: Blueprint = {};

    Object.keys(options).forEach(key => {
      blueprint[key] = {
        description: string().required(),
      };
    });

    this.command = optimal(options, blueprint, {
      name: this.constructor.name,
      unknown: true,
    });

    return this;
  }

  /**
   * Set metadata about the binary/executable in which this driver wraps.
   */
  setMetadata(metadata: Partial<DriverMetadata>): this {
    this.metadata = optimal(
      metadata,
      {
        bin: string()
          .match(/^[a-z0-9-]+$/u)
          .required(),
        configName: string().required(),
        configOption: string('--config').empty(),
        configStrategy: string(STRATEGY_CREATE).oneOf([
          STRATEGY_CREATE,
          STRATEGY_REFERENCE,
          STRATEGY_COPY,
        ]),
        dependencies: array(string()),
        description: string().empty(),
        filterOptions: bool(false),
        helpOption: string('--help'),
        title: string().required(),
        useConfigOption: bool(),
        workspaceStrategy: string(STRATEGY_REFERENCE).oneOf([STRATEGY_REFERENCE, STRATEGY_COPY]),
      },
      {
        name: this.constructor.name,
      },
    );

    return this;
  }
}
