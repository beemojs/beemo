import { Path } from '@boost/common';
import { Routine, Task, Predicates } from '@boost/core';
import parseArgs, { Arguments } from 'yargs-parser';
import Beemo from '../../Beemo';
import Script from '../../Script';
import formatExecReturn, { ExecLike } from '../../utils/formatExecReturn';
import ScriptContext from '../../contexts/ScriptContext';
import { ExecuteType, ExecuteQueue } from '../../types';

export interface ExecuteScriptOptions {
  packageRoot?: string;
}

export default class ExecuteScriptRoutine extends Routine<
  ScriptContext,
  Beemo,
  ExecuteScriptOptions
> {
  blueprint({ string }: Predicates) /* infer */ {
    return {
      packageRoot: string(),
    };
  }

  /**
   * Run the script while also parsing arguments to use as options.
   *
   * When a script is ran in multiple workspace packages, each context should have a different root,
   * but we can't modify the context without changing the reference across all packages.
   * So create a new context, copy over the old properties, and set the new root.
   */
  async execute(oldContext: ScriptContext, script: Script): Promise<unknown> {
    const context = oldContext.clone();

    // Set the context so tasks inherit it
    this.setContext(context);

    // Update the cwd to point to the package root
    if (this.options.packageRoot) {
      context.cwd = new Path(this.options.packageRoot);
    }

    const { argv } = context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    await script.onBeforeExecute.emit([context, argv]);

    const args = parseArgs(argv, script.args());
    let result = null;

    try {
      result = await script.execute(context, args);

      // Queue and run sub-tasks
      const queue = result as ExecuteQueue<ScriptContext>;

      if (typeof queue === 'object' && queue && queue.type && Array.isArray(queue.tasks)) {
        result = await this.runScriptTasks(args, queue.type, queue.tasks);
      }

      this.debug('  Success: %o', formatExecReturn(result as ExecLike));

      await script.onAfterExecute.emit([context, result]);
    } catch (error) {
      this.debug('  Failure: %o', formatExecReturn(error));
      this.debug('  Error message: %s', error.message);

      await script.onFailedExecute.emit([context, error]);

      throw error;
    }

    return result;
  }

  /**
   * Add the enqueued tasks to the routine so they show in the console,
   * and then run using the defined process.
   */
  async runScriptTasks(
    args: Arguments,
    type: ExecuteType,
    tasks: Task<ScriptContext>[],
  ): Promise<unknown> {
    tasks.forEach((task) => {
      this.task(task.title, task.action, this.context.script);
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
