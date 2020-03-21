import { Routine } from '@boost/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import Beemo from '../Beemo';
import DriverContext from '../contexts/DriverContext';

export default class CleanupConfigsRoutine extends Routine<DriverContext, Beemo> {
  bootstrap() {
    this.task(this.tool.msg('app:configCleanup'), this.deleteConfigFiles);
  }

  /**
   * Delete all temporary config files.
   */
  async deleteConfigFiles(context: DriverContext): Promise<boolean[]> {
    return Promise.all(
      context.configPaths.map((config) => {
        this.debug('Deleting config file %s', chalk.cyan(config.path));

        this.tool
          .getPlugin('driver', config.driver)
          .onDeleteConfigFile.emit([context, config.path]);

        return fs.remove(config.path.path()).then(() => true);
      }),
    );
  }
}
