/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs-extra';
import { Routine } from 'boost';
import Config, { bool } from 'optimal';

import type { ResultPromise } from 'boost';
import type { CleanupConfig } from './types';

export default class PostlaunchRoutine extends Routine<CleanupConfig> {
  bootstrap() {
    this.config = new Config(this.config, {
      persist: bool(),
    }, {
      name: 'PostlaunchRoutine',
    });
  }

  /**
   * The PostlaunchRoutine handles the process of cleaning up root after
   * the current execuction.
   */
  execute(): ResultPromise {
    this.task('Deleting temporary config files', this.deleteConfigFiles);

    return this.parallelizeTasks();
  }

  /**
   * Delete all temporary config files.
   */
  deleteConfigFiles(): Promise<*[]> {
    return Promise.all(
      Object.values(this.context.configFilePaths).map(configPath => fs.remove(configPath)),
    );
  }
}
