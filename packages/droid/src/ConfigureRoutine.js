/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import chalk from 'chalk';
import Config from './configure/Config';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Engine from './Engine';

import type { ConfigureConfig, DroidContext } from './types';

export default class ConfigureRoutine extends Routine<ConfigureConfig, DroidContext> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * Pipe a routine for every engine we need to create a configuration for,
   * and then run in parallel.
   */
  createConfigFiles(engines: Engine[]): Promise<*> {
    const names = engines.map((engine) => {
      const routine = new CreateConfigRoutine(engine.name, engine.metadata.title);

      // Make the engine easily available
      routine.engine = engine;

      this.pipe(routine);

      return engine.name;
    });

    this.tool.debug(
      `Creating config files for the following engines: ${chalk.magenta(names.join(', '))}`,
    );

    return this.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }

  /**
   * The ConfigureRoutine handles the process of creating a configuration file
   * for every engine required for the current execution.
   */
  execute(): Promise<*> {
    this.task('Resolving dependencies', this.resolveDependencies);
    this.task('Creating configuration files', this.createConfigFiles);

    return this.serializeTasks();
  }

  /**
   * Recursively loop through an engine's dependencies, adding a dependenct engine for each,
   * starting from the primary engine (the command that initiated the process).
   */
  resolveDependencies(): Promise<Engine[]> {
    const { primaryEngine } = this.context;
    const queue = [primaryEngine];

    this.tool.debug(`Resolving dependencies for ${chalk.magenta(primaryEngine.name)}`);

    while (queue.length) {
      const engine = queue.shift();

      engine.metadata.dependencies.forEach((name) => {
        this.tool.debug(`\tIncluding dependency ${chalk.yellow(name)}`);

        this.context.engines.unshift(this.tool.getPlugin(name));
      });
    }

    this.tool.emit('resolve-dependencies', null, [this.context.engines]);

    return Promise.resolve(this.context.engines);
  }
}
