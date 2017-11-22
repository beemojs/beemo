/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from 'rocket';

import type { Execution } from 'rocket';

export default class BabelEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: '.babelrc',
      description: 'Transpile files using Babel.',
      title: 'Babel',
    });
  }

  handleFailure({ stderr }: Execution) {
    this.tool.logError(stderr);
  }

  handleSuccess({ stdout }: Execution) {
    if (stdout) {
      this.tool.log(stdout);
    }
  }
}
