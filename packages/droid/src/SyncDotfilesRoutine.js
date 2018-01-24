/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import chalk from 'chalk';
import copy from 'copy';
import fs from 'fs-extra';
import path from 'path';
import { Routine } from 'boost';

export default class SyncDotfilesRoutine extends Routine {
  execute(configRoot: string): Promise<string[]> {
    this.task('Copying files', this.copyFilesFromConfigModule);
    this.task('Renaming files', this.renameFilesWithDot);

    return this.serializeTasks(configRoot);
  }

  /**
   * Copy all files from the config module's "dotfiles/" folder.
   */
  copyFilesFromConfigModule(configRoot: string): Promise<string[]> {
    const dotfilePath = path.join(configRoot, 'dotfiles/*');

    return new Promise((resolve, reject) => {
      copy(dotfilePath, this.tool.options.root, (error, files) => {
        this.tool.invariant(
          !error,
          `Coping dotfiles from ${chalk.cyan(dotfilePath)}`,
          'Copied',
          'Failed',
        );

        if (error) {
          reject(error);
        } else {
          resolve(files.map((file) => {
            this.tool.emit('create-dotfile', null, [file.path]);

            this.tool.debug(`\t${file.path}`);

            return file.path;
          }));
        }
      });
    });
  }

  /**
   * The original files are not prefixed with ".", as it causes git/npm issues
   * in the repository. So we need to rename them after they are copied.
   */
  renameFilesWithDot(filePaths: string[]): Promise<string[]> {
    this.tool.debug('Renaming dotfiles and prefixing with a period');

    return Promise.all(filePaths.map((filePath) => {
      const dir = path.dirname(filePath);
      const newName = `.${path.basename(filePath)}`;
      const newPath = path.join(dir, newName);

      // TODO show from config module as prefix?
      this.tool.log(`-> ${newName}`);

      return fs.rename(filePath, newPath).then(() => newPath);
    }));
  }
}
