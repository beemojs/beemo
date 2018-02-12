/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import merge from 'lodash/merge';
import Options, { array, bool, number, object, string, union } from 'optimal';

import type { EventListener } from 'boost';
import typeof Yargs from 'yargs';
import type { DriverContext, DriverOptions, DriverMetadata, Execution } from './types';

export default class Driver extends Plugin<DriverOptions> {
  context: DriverContext;

  metadata: DriverMetadata = {
    bin: '',
    configName: '',
    configOption: '',
    dependencies: [],
    description: '',
    helpOption: '',
    title: '',
    useConfigOption: false,
  };

  constructor(options?: Object = {}) {
    super(options);

    this.options = new Options(
      this.options,
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
   * Setup additional command options.
   */
  bootstrapCommand(command: Yargs) {}

  /**
   * Format the configuration file before it's written.
   */
  formatConfig(data: Object): string {
    return JSON.stringify(data, null, 2);
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
   * Set metadata about the binary/executable in which this driver wraps.
   */
  setMetadata(metadata: Object): this {
    this.metadata = new Options(
      metadata,
      {
        bin: string()
          .match(/^[-a-z0-9]+$/)
          .required(),
        configName: string().required(),
        configOption: string('--config'),
        dependencies: array(string()),
        description: string().empty(),
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
