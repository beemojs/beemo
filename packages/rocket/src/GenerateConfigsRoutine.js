/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import CreateConfigRoutine from './CreateConfigRoutine';

export default class GenerateConfigsRoutine extends Routine {
  /**
   * Pipe a routine for every engine we need to create a configuration for,
   * and then run in parallel.
   */
  execute(): Promise<Object[]> {
    this.context.engines.forEach((engine) => {
      const routine = new CreateConfigRoutine(engine.name, engine.metadata.title);

      routine.engine = engine;

      this.pipe(routine);
    });

    return this.parallelizeSubroutines();
  }
}
