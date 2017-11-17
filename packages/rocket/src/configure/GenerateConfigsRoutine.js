/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import CreateConfigRoutine from './CreateConfigRoutine';
import Config from './Config';

import type { ResultPromise } from 'boost';
import type { ConfigureConfig } from '../types';

export default class GenerateConfigsRoutine extends Routine<ConfigureConfig> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * Pipe a routine for every engine we need to create a configuration for,
   * and then run in parallel.
   */
  execute(): ResultPromise {
    this.context.engines.forEach((engine) => {
      const routine = new CreateConfigRoutine(engine.name, engine.metadata.title);

      routine.engine = engine;

      this.pipe(routine);
    });

    return this.config.parallel
      ? this.parallelizeSubroutines()
      : this.serializeSubroutines();
  }
}
