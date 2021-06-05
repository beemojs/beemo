import { Driver, STRATEGY_REFERENCE } from '@beemo/core';
import { RollupConfig } from './types';

// Success:
//  Writes bundle contents to stdout if no `-o/--file`
//  Writes input -> output file list to stderr
// Failure:
//  Writes input -> output file list to stderr with syntax/error
export class RollupDriver extends Driver<RollupConfig> {
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
}
