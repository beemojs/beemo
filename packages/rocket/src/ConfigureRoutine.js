/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import Config from './configure/Config';
import GenerateConfigsRoutine from './configure/GenerateConfigsRoutine';
import ResolveDependenciesRoutine from './configure/ResolveDependenciesRoutine';

import type { ResultPromise } from 'boost';
import type { ConfigureConfig } from './types';

// $FlowIgnore
export default class ConfigureRoutine extends Routine<ConfigureConfig> {
  bootstrap() {
    this.config = new Config(this.config);
  }

  /**
   * The PrelaunchRoutine handles the process of creating a configuration file
   * for every engine required for the current execution.
   */
  execute(): ResultPromise {
    return this
      .pipe(new ResolveDependenciesRoutine('resolve', 'Resolving dependencies'))
      .pipe(new GenerateConfigsRoutine('generate', 'Generating configuration files', this.config))
      .serializeSubroutines();
  }
}
