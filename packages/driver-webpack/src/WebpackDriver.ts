import { Driver, STRATEGY_REFERENCE } from '@beemo/core';
import { WebpackConfig } from './types';

// Success: Writes bundle/file metadata to stdout
// Failure: Writes failed tests to stderr
export class WebpackDriver extends Driver<WebpackConfig> {
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
}
