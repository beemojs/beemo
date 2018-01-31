/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';
import ConfigOps from 'eslint/lib/config/config-ops';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout
export default class ESLintDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc',
      description: 'Lint files with ESLint.',
      title: 'ESLint',
    });
  }

  mergeConfig(prev: Object, next: Object): Object {
    return ConfigOps.merge(prev, next);
  }
}
