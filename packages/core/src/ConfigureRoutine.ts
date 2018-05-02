/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Driver from './Driver';
import { BeemoConfig, DriverContext } from './types';

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
  createConfigFiles(context: DriverContext, drivers: Driver[]): Promise<string | string[]> {
    const names = drivers.map(driver => {
      const routine = new CreateConfigRoutine(driver.name, driver.metadata.configName, { driver });

      this.pipe(routine);

      return driver.name;
    });

    this.debug(
      'Creating config files for the following drivers: %s',
      chalk.magenta(names.join(', ')),
    );

    return this.tool.config.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies(context: DriverContext): Promise<Driver[]> {
    const { driverName, primaryDriver } = context;
    const queue = [primaryDriver];

    this.debug('Resolving dependencies for %s', chalk.magenta(driverName));

    while (queue.length) {
      const driver = queue.shift()!;
      const deps = new Set(driver.getDependencies());

      deps.forEach(name => {
        this.debug('  Including dependency %s', chalk.magenta(name));

        queue.push(this.tool.getPlugin(name) as Driver);
      });

      context.drivers.unshift(driver);
    }

    this.tool.emit('resolve-dependencies', [context.drivers]);

    return Promise.resolve(context.drivers);
  }
}
