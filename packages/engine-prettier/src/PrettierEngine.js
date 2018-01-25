/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from '@beemo/core';

export default class PrettierEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: '.prettierrc',
      description: 'Format code with Prettier.',
      title: 'Prettier',
    });
  }
}
