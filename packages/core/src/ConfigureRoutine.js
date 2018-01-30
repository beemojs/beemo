/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import Config from './configure/Config';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Driver from './Driver';

import type { ConfigureConfig, BeemoContext } from './types';

export default class ConfigureRoutine extends Routine<ConfigureConfig, BeemoContext> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * Pipe a routine for every driver we need to create a configuration for,
   * and then run in parallel.
   */
  createConfigFiles(drivers: Driver[]): Promise<*> {
    const names = drivers.map((driver) => {
      const routine = new CreateConfigRoutine(driver.name, driver.metadata.title);

      // Make the driver easily available
      routine.driver = driver;

      this.pipe(routine);

      return driver.name;
    });

    this.tool.debug(
      `Creating config files for the following drivers: ${chalk.magenta(names.join(', '))}`,
    );

    return this.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }

  /**
   * The ConfigureRoutine handles the process of creating a configuration file
   * for every driver required for the current execution.
   */
  execute(): Promise<*> {
    this.task('Resolving dependencies', this.resolveDependencies);
    this.task('Creating configuration files', this.createConfigFiles);

    return this.serializeTasks();
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies(): Promise<Driver[]> {
    const { primaryDriver } = this.context;
    const queue = [primaryDriver];

    this.tool.debug(`Resolving dependencies for ${chalk.magenta(primaryDriver.name)}`);

    while (queue.length) {
      const driver = queue.shift();
      const deps = new Set([
        // Always required; configured by the driver
        ...driver.metadata.dependencies,
        // Custom; configured by the consumer
        ...driver.options.dependencies,
      ]);

      deps.forEach((name) => {
        this.tool.debug(`  Including dependency ${chalk.magenta(name)}`);

        this.context.drivers.unshift(this.tool.getPlugin(name));
      });
    }

    this.tool.emit('resolve-dependencies', [this.context.drivers]);

    return Promise.resolve(this.context.drivers);
  }
}
