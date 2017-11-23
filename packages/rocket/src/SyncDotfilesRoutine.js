/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import copy from 'copy';
import fs from 'fs-extra';
import path from 'path';
import { Routine } from 'boost';

import type { ResultPromise } from 'boost';

export default class SyncDotfilesRoutine extends Routine<{}> {
  execute(configRoot: string): ResultPromise {
    this.task('Copying files', this.copyFilesFromConfigModule);
    this.task('Renaming files', this.renameFilesWithDot);

    return this.serializeTasks(configRoot);
  }

  /**
   * Copy all files from the config module's "dotfiles/" folder.
   */
  copyFilesFromConfigModule(configRoot: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      copy(path.join(configRoot, 'dotfiles/*'), this.tool.options.root, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files.map(file => file.path));
        }
      });
    });
  }

  /**
   * The original files are not prefixed with ".", as it causes git/npm issues
   * in the repository. So we need to rename them after they are copied.
   */
  renameFilesWithDot(filePaths: string[]): ResultPromise {
    return Promise.all(filePaths.map((filePath) => {
      const dir = path.dirname(filePath);
      const newName = `.${path.basename(filePath)}`;

      // TODO show from config module as prefix?
      this.tool.log(`-> ${newName}`);

      return fs.rename(filePath, path.join(dir, newName));
    }));
  }
}
