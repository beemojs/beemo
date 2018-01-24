/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from '@droid/core';
import ConfigOps from 'eslint/lib/config/config-ops';

export default class ESLintEngine extends Engine {
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
