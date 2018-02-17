/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import fs from 'fs-extra';

import type { BeemoConfig, DriverContext } from './types';

export default class CleanupRoutine extends Routine<BeemoConfig, DriverContext> {
  execute(): Promise<boolean[]> {
    this.task('Deleting config files', this.deleteConfigFiles).skip(
      !this.tool.config.config.cleanup,
    );

    return this.serializeTasks();
  }

  /**
   * Delete all temporary config files.
   */
  deleteConfigFiles(): Promise<boolean[]> {
    return Promise.all(
      this.context.configPaths.map(configPath => {
        this.tool.debug(`Deleting config file ${chalk.cyan(configPath)}`);

        this.tool.emit('delete-config-file', [configPath]);

        return fs.remove(configPath).then(() => true);
      }),
    );
  }
}
