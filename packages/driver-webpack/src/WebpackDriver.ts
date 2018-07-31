/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Driver, STRATEGY_REFERENCE } from '@beemo/core';
import { WebpackConfig } from './types';

// Success: Writes passed tests to stdout
// Failure: Writes failed tests to stderr
export default class WebpackDriver extends Driver<WebpackConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'webpack',
      configName: 'webpack.config.js',
      configStrategy: STRATEGY_REFERENCE,
      description: 'Bundle source files with Webpack',
      title: 'Webpack',
    });
  }
}
