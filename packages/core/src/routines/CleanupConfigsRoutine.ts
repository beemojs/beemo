/* eslint-disable @typescript-eslint/member-ordering */

import fs from 'fs-extra';
import { Bind, Blueprint, Predicates } from '@boost/common';
import { color } from '@boost/internal';
import { Routine } from '@boost/pipeline';
import DriverContext from '../contexts/DriverContext';
import type Tool from '../Tool';
import { RoutineOptions } from '../types';

export default class CleanupConfigsRoutine extends Routine<unknown, unknown, RoutineOptions> {
  blueprint({ instance }: Predicates): Blueprint<RoutineOptions> {
    return {
      tool: instance<Tool>().required().notNullable(),
    };
  }

  execute(context: DriverContext) {
    return this.createWaterfallPipeline(context)
      .pipe(this.options.tool.msg('app:configCleanup'), this.deleteConfigFiles)
      .run();
  }

  /**
   * Delete all temporary config files.
   */
  @Bind()
  async deleteConfigFiles(context: DriverContext): Promise<void> {
    await Promise.all(
      context.configPaths.map((config) => {
        this.debug('Deleting config file %s', color.filePath(config.path));

        this.options.tool.driverRegistry
          .get(config.driver)
          .onDeleteConfigFile.emit([context, config.path]);

        return fs.remove(config.path.path());
      }),
    );
  }
}
