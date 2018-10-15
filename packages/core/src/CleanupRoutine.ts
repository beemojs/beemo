/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine } from '@boost/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import DriverContext from './contexts/DriverContext';
import { BeemoTool } from './types';

export default class CleanupRoutine extends Routine<DriverContext, BeemoTool> {
  async execute(): Promise<boolean[]> {
    this.task(this.tool.msg('app:configCleanup'), this.deleteConfigFiles).skip(
      !this.tool.config.configure.cleanup,
    );

    return this.serializeTasks();
  }

  /**
   * Delete all temporary config files.
   */
  async deleteConfigFiles(context: DriverContext): Promise<boolean[]> {
    return Promise.all(
      context.configPaths.map(config => {
        this.debug('Deleting config file %s', chalk.cyan(config.path));

        this.tool.emit(`${config.driver}.delete-config-file`, [config.path]);

        return fs.remove(config.path).then(() => true);
      }),
    );
  }
}
