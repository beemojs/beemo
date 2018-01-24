/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import merge from 'lodash/merge';
import Options, { array, bool, number, object, string, union } from 'optimal';

import typeof Yargs from 'yargs';
import type { Execution } from './types';

type EngineOptions = {
  args: string[],
  env: { [key: string]: string },
};

type Metadata = {
  bin: string,
  configName: string,
  dependencies: string[],
  description: string,
  helpOption: string,
  title: string,
};

export default class Engine extends Plugin<EngineOptions> {
  metadata: Metadata = {
    bin: '',
    configName: '',
    dependencies: [],
    description: '',
    helpOption: '',
    title: '',
  };

  constructor(options?: Object = {}) {
    super(options);

    this.options = new Options(this.options, {
      args: union([
        string(),
        array(string()),
      ], []),
      env: object(union([
        bool(),
        number(),
        string(),
      ])),
    }, {
      name: this.constructor.name,
    });
  }

  /**
   * Format the configuration file before it's written.
   */
  formatFile(data: Object): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Handle command failures according to this engine.
   */
  handleFailure(error: Execution) {
    const { stderr, stdout } = error;
    const out = (stderr || stdout).trim();

    if (out) {
      this.tool.logError(out);
    }
  }

  /**
   * Handle successful commands according to this engine.
   */
  handleSuccess(response: Execution) {
    const out = response.stdout.trim();

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
   * Set metadata about the binary/executable in which this engine wraps.
   */
  setMetadata(metadata: Object): this {
    this.metadata = new Options(metadata, {
      bin: string().match(/^[-a-z0-9]+$/),
      configName: string(),
      dependencies: array(string()),
      description: string().empty(),
      helpOption: string('--help'),
      title: string(),
    }, {
      name: this.constructor.name,
    });

    return this;
  }

  /**
   * Setup additional command options.
   */
  setOptions(command: Yargs) {}
}
