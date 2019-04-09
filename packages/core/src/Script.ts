import { Plugin, Task, TaskAction } from '@boost/core';
import { Options } from 'yargs-parser';
import execa, { Options as ExecaOptions, ExecaReturns } from 'execa';
import ScriptContext from './contexts/ScriptContext';
import { ExecuteType } from './types';

export default abstract class Script<
  Args extends object = {},
  Opts extends object = {}
> extends Plugin<Opts> {
  tasks: Task<any>[] = [];

  /**
   * Define a configuration object to parse args with.
   */
  args(): Options {
    return {};
  }

  /**
   * Execute the script with the context and parsed args.
   */
  async execute(context: ScriptContext, args: Args): Promise<any> {
    return this.executeTasks('serial');
  }

  /**
   * Execute a command with the given arguments and pass the results through a promise.
   */
  async executeCommand(
    command: string,
    args: string[],
    options: ExecaOptions = {},
  ): Promise<ExecaReturns> {
    return execa(command, args, options);
  }

  /**
   * Execute the enqueued tasks using the defined process.
   */
  async executeTasks(type: ExecuteType) {
    return Promise.resolve({
      tasks: this.tasks,
      type,
    });
  }

  /**
   * Define an individual task that will be piped to an upstream routine.
   */
  task(title: string, action: TaskAction<any>): Task<any> {
    if (typeof action !== 'function') {
      throw new TypeError(this.tool.msg('errors:taskRequireAction'));
    }

    const task = new Task(title, action);

    this.tasks.push(task);

    return task;
  }
}
