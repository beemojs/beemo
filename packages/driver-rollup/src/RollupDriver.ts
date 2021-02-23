import { Driver, Execution, ExecutionError, STRATEGY_REFERENCE } from '@beemo/core';
import { RollupConfig } from './types';

// Success:
//    Writes bundle contents to stdout if no `-o/--file`
//    Writes input -> output file list to stderr
// Failure:
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

  processSuccess(response: Execution) {
    const out = response.stdout.trim();
    const err = response.stderr.trim();

    if (response.command?.includes('--coverage')) {
      this.setOutput('stdout', `${err}\n${out}`);
    } else if (err) {
      this.setOutput('stdout', err);
    }
  }
}
