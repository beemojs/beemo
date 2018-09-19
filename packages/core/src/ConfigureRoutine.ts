/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine } from '@boost/core';
import chalk from 'chalk';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Driver from './Driver';
import DriverContext from './contexts/DriverContext';

export default class ConfigureRoutine extends Routine<DriverContext> {
  bootstrap() {
    this.resolveDependencies();
    this.setupConfigFiles();
  }

  async execute(): Promise<string | string[]> {
    return this.tool.config.config.parallel ? this.parallelizeRoutines() : this.serializeRoutines();
  }

  /**
   * Pipe a routine for every driver we need to create a configuration for,
   * and then run in parallel.
   */
  setupConfigFiles() {
    const names = [...this.context.drivers].reverse().map(driver => {
      const routine = new CreateConfigRoutine(driver.name, driver.metadata.configName, { driver });

      this.pipe(routine);

      return driver.name;
    });

    this.debug(
      'Creating config files for the following drivers: %s',
      chalk.magenta(names.join(', ')),
    );
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies() {
    const { driverName, primaryDriver } = this.context;
    const queue = [primaryDriver];

    this.debug('Resolving dependencies for %s', chalk.magenta(driverName));

    while (queue.length) {
      const driver = queue.shift()!;
      const deps = new Set(driver.getDependencies());

      deps.forEach(name => {
        this.debug('  Including dependency %s', chalk.magenta(name));

        queue.push(this.tool.getPlugin(name) as Driver<any>);
      });

      this.context.addDriverDependency(driver);
    }

    this.tool.emit('resolve-dependencies', [Array.from(this.context.drivers)]);
  }
}
