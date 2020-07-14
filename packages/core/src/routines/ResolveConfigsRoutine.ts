import { Blueprint, Predicates, Path } from '@boost/common';
import { Routine } from '@boost/pipeline';
import chalk from 'chalk';
import Tool from '../Tool';
import ConfigContext from '../contexts/ConfigContext';
import CreateConfigRoutine from './CreateConfigRoutine';
import { RoutineOptions } from '../types';

export default class ResolveConfigsRoutine<
  Ctx extends ConfigContext = ConfigContext
> extends Routine<Path[], unknown, RoutineOptions> {
  blueprint({ instance }: Predicates): Blueprint<RoutineOptions> {
    return {
      tool: instance(Tool).required().notNullable(),
    };
  }

  async execute(context: Ctx): Promise<Path[]> {
    this.resolveDependencies(context);

    const routines = this.setupConfigFiles(context);

    // Parallel
    if (this.options.tool.config.configure.parallel) {
      const pipeline = routines.reduce(
        (pl, routine) => pl.add(routine),
        this.createConcurrentPipeline<Ctx, unknown, Path>(context),
      );

      return pipeline.run();
    }

    // Serial
    const pipeline = routines.reduce(
      (pl, routine) => pl.pipe(routine),
      this.createWaterfallPipeline<Ctx, Path>(context),
    );

    return [await pipeline.run()];
  }

  /**
   * Pipe a routine for every driver we need to create a configuration for,
   * and then run in parallel.
   */
  setupConfigFiles(context: Ctx) {
    const names: string[] = [];
    const routines = [...context.drivers].reverse().map((driver) => {
      names.push(driver.name);

      return new CreateConfigRoutine(driver.name, driver.metadata.configName, {
        driver,
        tool: this.options.tool,
      });
    });

    this.debug(
      'Creating config files for the following drivers: %s',
      chalk.green(names.join(', ')),
    );

    return routines;
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies(context: Ctx) {
    const { tool } = this.options;
    const queue = [...context.drivers];

    this.debug('Resolving dependencies');

    while (queue.length > 0) {
      const driver = queue.shift()!;
      const deps = new Set(driver.getDependencies());

      this.debug('Resolving %s', driver.name);

      deps.forEach((name) => {
        this.debug('  Including dependency %s', chalk.green(name));

        queue.push(tool.driverRegistry.get(name));
      });

      context.addDriverDependency(driver);
    }

    tool.onResolveDependencies.emit([context, Array.from(context.drivers)]);
  }
}
