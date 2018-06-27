/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Plugin, EventListener } from 'boost';
import merge from 'lodash/merge';
import optimal, { array, bool, number, object, shape, string, union, Blueprint } from 'optimal';
import DriverContext from './contexts/DriverContext';
import {
  Argv,
  BeemoConfig,
  DriverCommandOptions,
  DriverOptions,
  DriverMetadata,
  Execution,
} from './types';

export const STRATEGY_REFERENCE = 'reference';
export const STRATEGY_COPY = 'copy';

export default class Driver<T> extends Plugin<DriverOptions> {
  command: DriverCommandOptions = {};

  // @ts-ignore Set after instantiation
  config: T;

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
      },
      {
        name: this.constructor.name,
      },
    );
  }

  /**
   * Format the configuration file before it's written.
   */
  formatConfig(data: T): string {
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
    // this.tool.logError(JSON.stringify(error));

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
    // this.tool.log(JSON.stringify(response));

    if (out) {
      this.tool.log(out);
    }
  }

  /**
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: T, next: T): T {
    return merge(prev, next);
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
      blueprint[key] = shape({
        alias: union([string(), array(string())], ''),
        description: string().required(),
      });
    });

    this.command = optimal(options, blueprint, {
      name: this.constructor.name,
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
          .match(/^[-a-z0-9]+$/)
          .required(),
        configName: string().required(),
        configOption: string('--config').empty(),
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
