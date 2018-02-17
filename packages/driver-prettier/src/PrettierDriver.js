/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

// Success: Writes file list to stdout
// Failure: Writes to stderr for no files found and syntax errors
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
