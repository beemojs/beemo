import { Driver, ExecutionError, STRATEGY_REFERENCE } from '@beemo/core';
import { WebpackConfig } from './types';

// Success: Writes bundle/file metadata to stdout
// Failure: Writes failed tests to stderr
export default class WebpackDriver extends Driver<WebpackConfig> {
  readonly name = '@beemo/driver-webpack';

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

  extractErrorMessage(error: ExecutionError): string {
    if (error.message.indexOf('|') > 0) {
      return error.message.split(/|\s+at$/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }
}
