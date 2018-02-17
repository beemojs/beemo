/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Driver from './Driver';

import type { BeemoConfig, DriverContext } from './types';

export default class ConfigureRoutine extends Routine<BeemoConfig, DriverContext> {
  execute(): Promise<string | string[]> {
    this.task('Resolving dependencies', this.resolveDependencies);
    this.task('Creating configuration files', this.createConfigFiles);

    return this.serializeTasks();
  }

  /**
   * Pipe a routine for every driver we need to create a configuration for,
   * and then run in parallel.
   */
  createConfigFiles(drivers: Driver[]): Promise<string | string[]> {
    const names = drivers.map(driver => {
      const routine = new CreateConfigRoutine(driver.name, driver.metadata.title);

      // Make the driver easily available
      routine.driver = driver;

      this.pipe(routine);

      return driver.name;
    });

    this.tool.debug(
      `Creating config files for the following drivers: ${chalk.magenta(names.join(', '))}`,
    );

    return this.tool.config.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies(): Promise<Driver[]> {
    const { driverName, primaryDriver } = this.context;
    const queue = [primaryDriver];

    this.tool.debug(`Resolving dependencies for ${chalk.magenta(driverName)}`);

    while (queue.length) {
      const driver = queue.shift();
      const deps = new Set(driver.getDependencies());

      deps.forEach(name => {
        this.tool.debug(`  Including dependency ${chalk.magenta(name)}`);

        queue.push(this.tool.getPlugin(name));
      });

      this.context.drivers.unshift(driver);
    }

    this.tool.emit('resolve-dependencies', [this.context.drivers]);

    return Promise.resolve(this.context.drivers);
  }
}
