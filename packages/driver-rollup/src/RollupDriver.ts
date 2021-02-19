import { Driver, ExecutionError, STRATEGY_REFERENCE } from '@beemo/core';
import { RollupConfig } from './types';

// Success: Writes passed tests to stdout
// Failure: Writes failed tests to stderr
export default class RollupDriver extends Driver<RollupConfig> {
  readonly name = '@beemo/driver-rollup';

  bootstrap() {
    this.setMetadata({
      bin: 'rollup',
      configName: 'rollup.config.js',
      configStrategy: STRATEGY_REFERENCE,
      description: this.tool.msg('app:rollupDescription'),
      title: 'Rollup',
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
