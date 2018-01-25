/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';
import ConfigOps from 'eslint/lib/config/config-ops';

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
