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
      description: this.tool.msg('app:webpackDescription'),
      title: 'Webpack',
      watchOptions: ['-w', '--watch'],
    });
  }

  extractErrorMessage(error: Error): string {
    if (error.message.indexOf('|') > 0) {
      return error.message.split(/|\s+at$/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }
}
