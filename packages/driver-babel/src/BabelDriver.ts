/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import rimraf from 'rimraf';
import { Driver, DriverContext } from '@beemo/core';
import { BabelConfig } from './types';

// Success: Writes file list to stdout
// Failure: Throws SyntaxError to stderr
export default class BabelDriver extends Driver<BabelConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: 'babel.config.js',
      configOption: '--config-file',
      description: this.tool.msg('app:babelDescription'),
      title: 'Babel',
      watchOptions: ['-w', '--watch'],
    });

    this.setCommandOptions({
      clean: {
        boolean: true,
        default: false,
        description: this.tool.msg('app:babelCleanOption'),
      },
    });

    this.on('babel.before-execute', this.handleCleanTarget);
  }

  extractErrorMessage(error: Error): string {
    if (error.message.includes('SyntaxError')) {
      return error.message.split(/|\s+at/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }

  /**
   * Automatically clean the target folder if --out-dir is used.
   */
  handleCleanTarget = ({ args }: DriverContext) => {
    if (args.clean && args.outDir) {
      rimraf.sync(path.resolve(args.outDir as string));
    }
  };
}
