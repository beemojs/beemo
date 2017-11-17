/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';

import type { ResultPromise } from 'boost';

export default class ResolveDependenciesRoutine extends Routine<{}> {
  /**
   * Recursively loop through an engine's dependencies, adding a dependenct engine for each,
   * starting from the primary engine (the command that initiated the process).
   */
  execute(): ResultPromise {
    const { primaryEngine } = this.context;
    const queue = [primaryEngine];

    while (queue.length) {
      const engine = queue.shift();

      engine.metadata.dependencies.forEach((name) => {
        this.context.engines.unshift(this.tool.getPlugin(name));
      });
    }

    return Promise.resolve();
  }
}
