/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs-extra';
import { Routine } from 'boost';
import Config from './cleanup/Config';

import type { ResultPromise } from 'boost';
import type { CleanupConfig } from './types';

// $FlowIgnore
export default class CleanupRoutine extends Routine<CleanupConfig> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * The PostlaunchRoutine handles the process of cleaning up root after
   * the current execuction.
   */
  execute(): ResultPromise {
    this.task('Deleting temporary config files', this.deleteConfigFiles).skip(this.config.persist);

    return this.parallelizeTasks();
  }

  /**
   * Delete all temporary config files.
   */
  deleteConfigFiles(): Promise<*[]> {
    return Promise.all(this.context.configPaths.map(configPath => fs.remove(configPath)));
  }
}
