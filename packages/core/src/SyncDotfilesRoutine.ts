/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import copy from 'copy';
import fs from 'fs-extra';
import path from 'path';
import { Routine } from 'boost';
import optimal, { string, Struct } from 'optimal';
import { Context } from './types';

export interface SyncDotfilesOptions extends Struct {
  filter: string;
}

export default class SyncDotfilesRoutine extends Routine<SyncDotfilesOptions, Context> {
  bootstrap() {
    this.options = optimal(
      this.options,
      {
        filter: string().empty(),
      },
      {
        name: 'SyncDotfilesRoutine',
      },
    );
  }

  execute(context: Context): Promise<string[]> {
    this.task('Copying files', this.copyFilesFromConfigModule);
    this.task('Renaming files', this.renameFilesWithDot);

    return this.serializeTasks(context.moduleRoot);
  }

  /**
   * Copy all files from the config module's "dotfiles/" folder.
   */
  copyFilesFromConfigModule(context: Context, moduleRoot: string): Promise<string[]> {
    const dotfilePath = path.join(moduleRoot, 'dotfiles/*');
    const { filter } = this.options;

    return new Promise((resolve, reject) => {
      copy(dotfilePath, this.tool.options.root, (error, files) => {
        this.tool.debug.invariant(
          !error,
          `Coping dotfiles from ${chalk.cyan(dotfilePath)}`,
          'Copied',
          'Failed',
        );

        if (filter) {
          const pattern = new RegExp(filter);

          this.tool.debug('Filtering dotfiles with "%s"', filter);

          // eslint-disable-next-line no-param-reassign
          files = files.filter(file => file.path.match(pattern));
        }

        if (error) {
          reject(error);
        } else {
          resolve(
            files.map(file => {
              this.tool.emit('copy-dotfile', [file.path]);

              this.tool.debug('  %s', chalk.gray(file.path));

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
  renameFilesWithDot(context: Context, filePaths: string[]): Promise<string[]> {
    this.tool.debug('Renaming dotfiles and prefixing with a period');

    return Promise.all(
      filePaths.map(filePath => {
        const dir = path.dirname(filePath);
        const newName = `.${path.basename(filePath)}`;
        const newPath = path.join(dir, newName);

        return fs.rename(filePath, newPath).then(() => {
          this.tool.emit('rename-dotfile', [newPath]);

          // this.tool.log(`${chalk.gray('->')} ${newName}`);

          this.tool.debug('  %s', chalk.gray(newPath));

          return newPath;
        });
      }),
    );
  }
}
