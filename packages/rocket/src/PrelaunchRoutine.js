/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';
import Config, { bool } from 'optimal';
import GenerateConfigsRoutine from './GenerateConfigsRoutine';
import ResolveDependenciesRoutine from './ResolveDependenciesRoutine';

import type { ResultPromise } from 'boost';
import type { ConfigureConfig } from './types';

export default class PrelaunchRoutine extends Routine<ConfigureConfig> {
  bootstrap() {
    this.config = new Config(this.config, {
      parallel: bool(true),
    }, {
      name: 'PrelaunchRoutine',
    });
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
