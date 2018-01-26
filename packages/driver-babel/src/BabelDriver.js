/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import path from 'path';
import rimraf from 'rimraf';
import { Driver } from '@beemo/core';

import typeof Yargs from 'yargs';

export default class BabelDriver extends Driver {
  bootstrap() {
    this
      .setMetadata({
        bin: 'babel',
        configName: '.babelrc',
        description: 'Transpile files with Babel.',
        title: 'Babel',
      })
      .on('execute', this.handleExecute);
  }

  bootstrapCommand(command: Yargs) {
    command
      .option('clean', {
        boolean: true,
        default: true,
        describe: 'Clean the target folder',
      });
  }

  handleExecute(event: Event, driver: Driver, args: string[], options: Object) {
    if (!options.clean || !options.ourDir) {
      return;
    }

    // Automatically clean the target folder
    if (options.clean && options.ourDir) {
      rimraf.sync(path.resolve(options.outDir));
    }
  }
}
