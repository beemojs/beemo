/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import path from 'path';
import rimraf from 'rimraf';
import { Driver } from '@beemo/core';

import typeof Yargs from 'yargs';

// Success: Writes file list to stdout
// Failure: Throws SyntaxError to stderr
export default class BabelDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: '.babelrc',
      description: 'Transpile files with Babel.',
      title: 'Babel',
    }).on('babel.execute-driver', this.handleCleanTarget);
  }

  bootstrapCommand(command: Yargs) {
    command.option('clean', {
      boolean: true,
      default: true,
      describe: 'Clean the target folder',
    });
  }

  /**
   * Automatically clean the target folder if --out-dir is used.
   */
  handleCleanTarget(event: Event, driver: Driver, args: string[], options: Object) {
    if (options.clean && options.outDir) {
      rimraf.sync(path.resolve(options.outDir));
    }
  }
}
