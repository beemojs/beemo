/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

export default class PrettierDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: '.prettierrc',
      description: 'Format code with Prettier.',
      title: 'Prettier',
    });
  }
}
