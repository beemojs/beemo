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

import type { Context } from './types';

export default class SyncDotfilesRoutine extends Routine<Object, Context> {
  execute(): Promise<string[]> {
    this.task('Copying files', this.copyFilesFromConfigModule);
    this.task('Renaming files', this.renameFilesWithDot);

    return this.serializeTasks(this.context.moduleRoot);
  }

  /**
   * Copy all files from the config module's "dotfiles/" folder.
   */
  copyFilesFromConfigModule(moduleRoot: string): Promise<string[]> {
    const dotfilePath = path.join(moduleRoot, 'dotfiles/*');

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
          resolve(
            files.map(file => {
              this.tool.emit('create-dotfile', [file.path]);

              this.tool.debug(`  ${chalk.gray(file.path)}`);

              return file.path;
            }),
          );
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

    return Promise.all(
      filePaths.map(filePath => {
        const dir = path.dirname(filePath);
        const newName = `.${path.basename(filePath)}`;
        const newPath = path.join(dir, newName);

        return fs.rename(filePath, newPath).then(() => {
          this.tool.emit('rename-dotfile', [newPath]);

          this.tool.log(`${chalk.gray('->')} ${newName}`);

          this.tool.debug(`  ${chalk.gray(newPath)}`);

          return newPath;
        });
      }),
    );
  }
}
