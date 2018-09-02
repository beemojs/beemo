/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import rimraf from 'rimraf';
import { Argv, Driver, DriverContext } from '@beemo/core';
import { BabelConfig } from './types';

// Success: Writes file list to stdout
// Failure: Throws SyntaxError to stderr
export default class BabelDriver extends Driver<BabelConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: 'babel.config.js',
      configOption: '--config-file',
      description: 'Transpile files with Babel',
      title: 'Babel',
    });

    this.setCommandOptions({
      clean: {
        boolean: true,
        default: true,
        description: 'Clean the target folder',
      },
    });

    this.on('babel.before-execute', this.handleCleanTarget);
  }

  /**
   * Automatically clean the target folder if --out-dir is used.
   */
  handleCleanTarget = (driver: BabelDriver, argv: Argv, { args }: DriverContext) => {
    if (args.clean && args.outDir) {
      rimraf.sync(path.resolve(args.outDir));
    }
  };
}
