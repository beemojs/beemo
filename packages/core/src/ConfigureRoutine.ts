import { Routine } from '@boost/core';
import chalk from 'chalk';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import ConfigContext from './contexts/ConfigContext';
import { BeemoTool } from './types';

export default class ConfigureRoutine<T extends ConfigContext = ConfigContext> extends Routine<
  T,
  BeemoTool
> {
  bootstrap() {
    this.resolveDependencies();
    this.setupConfigFiles();
  }

  execute(): Promise<string | string[]> {
    return this.tool.config.configure.parallel
      ? this.parallelizeRoutines()
      : this.serializeRoutines();
  }

  /**
   * Pipe a routine for every driver we need to create a configuration for,
   * and then run in parallel.
   */
  setupConfigFiles() {
    const names = [...this.context.drivers].reverse().map(driver => {
      const routine = new CreateConfigRoutine<T>(driver.name, driver.metadata.configName, {
        driver,
      });

      this.pipe(routine);

      return driver.name;
    });

    this.debug(
      'Creating config files for the following drivers: %s',
      chalk.green(names.join(', ')),
    );
  }

  /**
   * Recursively loop through an driver's dependencies, adding a dependenct driver for each,
   * starting from the primary driver (the command that initiated the process).
   */
  resolveDependencies() {
    const queue = [...this.context.drivers];

    this.debug('Resolving dependencies');

    while (queue.length > 0) {
      const driver = queue.shift()!;
      const deps = new Set(driver.getDependencies());

      this.debug('Resolving %s', driver.name);

      deps.forEach(name => {
        this.debug('  Including dependency %s', chalk.green(name));

        queue.push(this.tool.getPlugin('driver', name));
      });

      this.context.addDriverDependency(driver);
    }

    this.tool.onResolveDependencies.emit([this.context, Array.from(this.context.drivers)]);
  }
}
