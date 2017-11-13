/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from 'rocket';
import ConfigOps from 'eslint/lib/config/config-ops';

export default class ESLintEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      description: 'Lint files with ESLint.',
      fileName: '.eslintrc',
      title: 'ESLint',
    });
  }

  mergeConfig(prev: Object, next: Object): Object {
    return ConfigOps.merge(prev, next);
  }
}
