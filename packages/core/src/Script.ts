/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Plugin, Task } from '@boost/core';
import { Options } from 'yargs-parser';
import ScriptContext from './contexts/ScriptContext';
import { ExecuteType } from './types';

export default class Script<Args extends object = {}, Opts extends object = {}> extends Plugin<
  Opts
> {
  protected tasks: Task<any>[] = [];

  blueprint() /* infer */ {
    return {} as any;
  }

  /**
   * Define a configuration object to parse args with.
   */
  args(): Options {
    return {};
  }

  /**
   * Execute the script with the context and parsed args.
   */
  execute(context: ScriptContext, args: Args): Promise<any> {
    return this.executeTasks('serial');
  }

  /**
   * Execute the enqueued tasks using the defined process.
   */
  executeTasks(type: ExecuteType) {
    return Promise.resolve({
      tasks: this.tasks,
      type,
    });
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
