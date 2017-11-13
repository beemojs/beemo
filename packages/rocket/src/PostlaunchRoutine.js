/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs-extra';
import { Routine } from 'boost';

export default class PostlaunchRoutine extends Routine {
  /**
   * The PostlaunchRoutine handles the process of cleaning up root after
   * the current execuction.
   */
  execute(): Promise<*> {
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
