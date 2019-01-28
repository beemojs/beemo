/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine, Task } from '@boost/core';
import { string } from 'optimal';
import parseArgs from 'yargs-parser';
import Script from '../Script';
import ScriptContext from '../contexts/ScriptContext';
import { BeemoTool, ExecuteType } from '../types';

export interface RunScriptOptions {
  packageRoot: string;
}

export default class RunScriptRoutine extends Routine<ScriptContext, BeemoTool, RunScriptOptions> {
  blueprint() /* infer */ {
    return {
      packageRoot: string().empty(),
    };
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  async execute(context: ScriptContext, script: Script): Promise<any> {
    const { argv } = context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    this.tool.emit(`${context.eventName}.before-execute`, [context, argv, script]);

    const args = parseArgs(argv, script.args());
    let result = null;

    try {
      result = await script.execute(context, args);

      if (typeof result === 'object' && result && result.type && Array.isArray(result.tasks)) {
        result = await this.runScriptTasks(args, result.type, result.tasks);
      }

      this.tool.emit(`${context.eventName}.after-execute`, [context, result, script]);
    } catch (error) {
      this.tool.emit(`${context.eventName}.failed-execute`, [context, error, script]);

      throw error;
    }

    return result;
  }

  /**
   * Run the tasks the script enqueued using the defined process.
   */
  async runScriptTasks(args: any, type: ExecuteType, tasks: Task<any>[]): Promise<any> {
    // Add the tasks to the routine so they show in the console
    this.tasks.push(...tasks);

    switch (type) {
      case 'parallel':
        return this.parallelizeTasks(args, tasks);
      case 'pool':
        return this.poolTasks(args, {}, tasks);
      case 'serial':
        return this.serializeTasks(args, tasks);
      case 'sync':
        return this.synchronizeTasks(args, tasks);
      default:
        throw new Error(`Unknown execution type "${type}"`);
    }
  }
}
