import { Routine, Task, Predicates } from '@boost/core';
import parseArgs, { Arguments } from 'yargs-parser';
import Script from '../Script';
import ScriptContext from '../contexts/ScriptContext';
import { BeemoTool, ExecuteType } from '../types';

export interface RunScriptOptions {
  packageRoot: string;
}

export default class RunScriptRoutine extends Routine<ScriptContext, BeemoTool, RunScriptOptions> {
  blueprint({ string }: Predicates) /* infer */ {
    return {
      packageRoot: string(),
    };
  }

  /**
   * When a script is ran in multiple workspace packages, each context should have a different root,
   * but we can't modify the context without changing the reference across all packages.
   * So create a new context, copy over the old properties, and set the new root.
   */
  bootstrap() {
    const context = this.context.clone();

    // Update the root to point to the package root
    if (this.options.packageRoot) {
      context.root = this.options.packageRoot;
    }

    // Set the context to the routine so tasks inherit it
    this.setContext(context);
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
   * Add the enqueued tasks to the routine so they show in the console,
   * and then run using the defined process.
   */
  async runScriptTasks(args: Arguments, type: ExecuteType, tasks: Task<any>[]): Promise<any> {
    tasks.forEach(task => {
      this.task(task.title, task.action);
    });

    switch (type) {
      case 'parallel':
        return this.parallelizeTasks(args);
      case 'pool':
        return this.poolTasks(args);
      case 'serial':
        return this.serializeTasks(args);
      case 'sync':
        return this.synchronizeTasks(args);
      default:
        throw new Error(this.tool.msg('errors:executeTypeUnknown', { type }));
    }
  }
}
