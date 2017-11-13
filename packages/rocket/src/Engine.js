/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import Options, { array, string } from 'optimal';

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
  meta: Metadata = {
    bin: '',
    dependencies: [],
    description: '',
    fileName: '',
    helpOption: '',
    title: '',
  };

  // TODO validate
  options: EngineOptions = {
    args: [],
    env: {},
  };

  /**
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: Object, next: Object): Object {
    throw new Error('Merging strategy has not been defined.');
  }

  /**
   * Set metadata about the binary/executable in which this engine wraps.
   */
  setMetadata(meta: Object): this {
    this.meta = new Options({
      ...this.meta,
      ...meta,
    }, {
      bin: string().match(/^[-a-z0-9]+$/),
      dependencies: array(string()),
      description: string().empty(),
      fileName: string(),
      helpOption: string(),
      title: string(),
    }, {
      name: this.constructor.name,
    });

    return this;
  }
}
