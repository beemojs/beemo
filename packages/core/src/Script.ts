/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Plugin, Task } from '@boost/core';
import { Options } from 'yargs-parser';
import { ScriptOptions } from './types';

export default class Script extends Plugin<ScriptOptions> {
  tasks: Task<any>[] = [];

  /**
   * Define a configuration object to parse args with.
   */
  args(): Options {
    return {};
  }

  /**
   * Define an individual task that will be piped to an upstream routine.
   */
  task(title: string, action: any): Task<any> {
    if (typeof action !== 'function') {
      throw new TypeError(this.tool.msg('errors:taskRequireAction'));
    }

    const task = new Task(title, action);

    this.tasks.push(task);

    return task;
  }
}
