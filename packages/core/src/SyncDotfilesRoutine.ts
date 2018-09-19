/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Routine } from '@boost/core';
import optimal, { string } from 'optimal';
import Context from './contexts/Context';
import isPatternMatch from './utils/isPatternMatch';

export interface SyncDotfilesOptions {
  filter: string;
}

export default class SyncDotfilesRoutine extends Routine<Context, SyncDotfilesOptions> {
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

  async execute(context: Context): Promise<string[]> {
    this.task('Copying files', this.copyFilesFromConfigModule);
    this.task('Renaming files', this.renameFilesWithDot);

    return this.serializeTasks(context.moduleRoot);
  }

  /**
   * Copy all files from the config module's "dotfiles/" folder.
   */
  async copyFilesFromConfigModule(context: Context, moduleRoot: string): Promise<string[]> {
    const dotfilePath = path.join(moduleRoot, 'dotfiles/*');
    const { appName, root } = this.tool.options;
    const { filter } = this.options;
    const files: string[] = [];

    this.debug('Coping dotfiles from %s', chalk.cyan(dotfilePath));

    await fs.copy(dotfilePath, root, {
      filter: file => {
        let filtered = true;

        if (filter) {
          this.debug('Filtering dotfiles with "%s"', filter);

          // @ts-ignore Contains not typed yet.
          filtered = isPatternMatch(file, filter, { contains: true });
        }

        if (filtered) {
          files.push(file);
        }

        return filtered;
      },
    });

    return files.map(file => {
      this.tool.emit(`${appName}.copy-dotfile`, [file]);

      this.debug('  %s', chalk.gray(file));

      return file;
    });
  }

  /**
   * The original files are not prefixed with ".", as it causes git/npm issues
   * in the repository. So we need to rename them after they are copied.
   */
  async renameFilesWithDot(context: Context, filePaths: string[]): Promise<string[]> {
    this.debug('Renaming dotfiles and prefixing with a period');

    return Promise.all(
      filePaths.map(async filePath => {
        const dir = path.dirname(filePath);
        const newName = `.${path.basename(filePath)}`;
        const newPath = path.join(dir, newName);

        await fs.rename(filePath, newPath);

        this.tool.emit(`${this.tool.options.appName}.rename-dotfile`, [newPath]);

        this.tool.log('%s %s', chalk.gray('->'), newName);

        this.debug('  %s', chalk.gray(newPath));

        return newPath;
      }),
    );
  }
}
