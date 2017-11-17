/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from 'rocket';
import ConfigOps from 'eslint/lib/config/config-ops';

import type { Execution } from 'rocket';

export default class ESLintEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc',
      description: 'Lint files with ESLint.',
      title: 'ESLint',
    });
  }

  handleFailure({ stdout }: Execution) {
    this.tool.logError(stdout);
  }

  handleSuccess({ stdout }: Execution) {
    // Warnings are handled here
    if (stdout) {
      this.tool.log(stdout);
    }
  }

  mergeConfig(prev: Object, next: Object): Object {
    return ConfigOps.merge(prev, next);
  }
}
