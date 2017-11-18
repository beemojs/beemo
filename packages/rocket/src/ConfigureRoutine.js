/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import Config from './configure/Config';
import CreateConfigRoutine from './configure/CreateConfigRoutine';
import Engine from './Engine';

import type { ResultPromise } from 'boost';
import type { ConfigureConfig } from './types';

export default class ConfigureRoutine extends Routine<ConfigureConfig> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * The PrelaunchRoutine handles the process of creating a configuration file
   * for every engine required for the current execution.
   */
  execute(): ResultPromise {
    this.task('Resolving dependencies', this.resolveDependencies);
    this.task('Generating configuration files', this.generateConfigs);

    return this.serializeTasks();
  }

  /**
   * Pipe a routine for every engine we need to create a configuration for,
   * and then run in parallel.
   */
  generateConfigs(engines: Engine[]): ResultPromise {
    engines.forEach((engine) => {
      const routine = new CreateConfigRoutine(engine.name, engine.metadata.title);

      // Make the engine easily available
      routine.engine = engine;

      this.pipe(routine);
    });

    return this.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }

  /**
   * Recursively loop through an engine's dependencies, adding a dependenct engine for each,
   * starting from the primary engine (the command that initiated the process).
   */
  resolveDependencies(): Promise<Engine[]> {
    const { primaryEngine } = this.context;
    const queue = [primaryEngine];

    while (queue.length) {
      const engine = queue.shift();

      engine.metadata.dependencies.forEach((name) => {
        this.context.engines.unshift(this.tool.getPlugin(name));
      });
    }

    return Promise.resolve(this.context.engines);
  }
}
