/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import GenerateConfigsRoutine from './GenerateConfigsRoutine';
import ResolveDependenciesRoutine from './ResolveDependenciesRoutine';

export default class PrelaunchRoutine extends Routine {
  /**
   * The PrelaunchRoutine handles the process of creating a configuration file
   * for every engine required for the current execution.
   */
  execute(): Promise<*> {
    return this
      .pipe(new ResolveDependenciesRoutine('resolve', 'Resolving engine dependencies'))
      .pipe(new GenerateConfigsRoutine('generate', 'Generating engine configurations'))
      .serializeSubroutines();
  }
}
