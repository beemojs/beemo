/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

export default class BabelDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: '.babelrc',
      description: 'Transpile files with Babel.',
      title: 'Babel',
    });
  }
}
