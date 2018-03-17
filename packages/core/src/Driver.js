/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import merge from 'lodash/merge';
import Options, { array, bool, number, object, shape, string, union } from 'optimal';

import type { EventListener } from 'boost';
import type {
  DriverCommandOptions,
  DriverContext,
  DriverOptions,
  DriverMetadata,
  Execution,
} from './types';

export default class Driver extends Plugin<DriverOptions> {
  command: DriverCommandOptions = {};

  context: DriverContext;

  metadata: DriverMetadata;

  constructor(options?: $Shape<DriverOptions> = {}) {
    super(options);

    this.options = new Options(
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
  formatConfig(data: Object): string {
    const content = JSON.stringify(data, null, 2);

    if (this.metadata.configName.endsWith('.js')) {
      return `module.exports = ${content};`;
    }

    return content;
  }

  /**
   * Return a list of user defined arguments.
   */
  getArgs(): string[] {
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
  mergeConfig(prev: Object, next: Object): Object {
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
    const blueprint = {};

    Object.keys(options).forEach(key => {
      blueprint[key] = shape({
        alias: union([string(), array(string())], ''),
        description: string().required(),
      });
    });

    this.command = new Options(options, blueprint, {
      name: this.constructor.name,
    });

    return this;
  }

  /**
   * Set metadata about the binary/executable in which this driver wraps.
   */
  setMetadata(metadata: $Shape<DriverMetadata>): this {
    this.metadata = new Options(
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
      },
      {
        name: this.constructor.name,
      },
    );

    return this;
  }
}
