/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';
import Options, { bool, string } from 'optimal';

type EngineOptions = {
  args: string[],
  env: { [key: string]: string },
};

type Metadata = {
  bin: string,
  description: string,
  fileName: string,
  optionName: string,
  title: string,
  useOption: boolean,
};

export default class Engine extends Plugin<EngineOptions> {
  meta: Metadata = {
    bin: '',
    description: '',
    fileName: '',
    optionName: '',
    title: '',
    useOption: false,
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
      description: string().empty(),
      fileName: string().empty().or('optionName'),
      optionName: string().empty().match(/^--?[-a-z]+$/).or('fileName'),
      title: string(),
      useOption: bool(false),
    }, {
      name: this.constructor.name,
    });

    return this;
  }
}
