import { Routine } from '@boost/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import DriverContext from './contexts/DriverContext';
import { BeemoTool } from './types';

export default class CleanupRoutine extends Routine<DriverContext, BeemoTool> {
  bootstrap() {
    this.task(this.tool.msg('app:configCleanup'), this.deleteConfigFiles);
  }

  /**
   * Delete all temporary config files.
   */
  async deleteConfigFiles(context: DriverContext): Promise<boolean[]> {
    return Promise.all(
      context.configPaths.map(config => {
        this.debug('Deleting config file %s', chalk.cyan(config.path));

        this.tool
          .getPlugin('driver', config.driver)
          .onDeleteConfigFile.emit([context, config.path]);

        return fs.remove(config.path).then(() => true);
      }),
    );
  }
}
