/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import merge from 'lodash/merge';
import Options, { array, bool, number, object, string, union } from 'optimal';

type EngineOptions = {
  args: string[],
  env: { [key: string]: string },
};

type Metadata = {
  bin: string,
  dependencies: string[],
  description: string,
  fileName: string,
  helpOption: string,
  title: string,
};

export default class Engine extends Plugin<EngineOptions> {
  metadata: Metadata = {
    bin: '',
    dependencies: [],
    description: '',
    fileName: '',
    helpOption: '',
    title: '',
  };

  options: EngineOptions = {
    args: [],
    env: {},
  };

  constructor(options?: Object = {}) {
    super(options);

    this.options = new Options(this.options, {
      args: array(string()),
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
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: Object, next: Object): Object {
    return merge(prev, next);
  }

  /**
   * Set metadatadata about the binary/executable in which this engine wraps.
   */
  setMetadata(metadata: Object): this {
    this.metadata = new Options(metadata, {
      bin: string().match(/^[-a-z0-9]+$/),
      dependencies: array(string()),
      description: string().empty(),
      fileName: string(),
      helpOption: string('--help'),
      title: string(),
    }, {
      name: this.constructor.name,
    });

    return this;
  }
}
