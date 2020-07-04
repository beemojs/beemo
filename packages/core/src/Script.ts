import { Task, TaskAction } from '@boost/core';
import { ConcurrentEvent } from '@boost/event';
import { Plugin } from '@boost/plugin';
import { Options } from 'yargs-parser';
import execa, { Options as ExecaOptions, ExecaReturnValue } from 'execa';
import ScriptContext from './contexts/ScriptContext';
import { Argv, ExecuteType, ExecuteQueue, Scriptable, BeemoTool } from './types';

export default abstract class Script<Args extends object = {}, Opts extends object = {}>
  extends Plugin<BeemoTool, Opts>
  implements Scriptable {
  tasks: Task<ScriptContext>[] = [];

  onBeforeExecute = new ConcurrentEvent<[ScriptContext, Argv]>('before-execute');

  onAfterExecute = new ConcurrentEvent<[ScriptContext, unknown]>('after-execute');

  onFailedExecute = new ConcurrentEvent<[ScriptContext, Error]>('failed-execute');

  static validate(script: Script) {
    if (typeof script.args !== 'function') {
      throw new TypeError('`Script`s require an `args()` method.');
    }

    if (typeof script.execute !== 'function') {
      throw new TypeError('`Script`s require an `execute()` method.');
    }
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
  async execute(context: ScriptContext, args: Args): Promise<unknown> {
    return this.executeTasks('serial');
  }

  /**
   * Execute a command with the given arguments and pass the results through a promise.
   */
  async executeCommand(
    command: string,
    args: string[],
    options: ExecaOptions = {},
  ): Promise<ExecaReturnValue> {
    return execa(command, args, options);
  }

  /**
   * Execute the enqueued tasks using the defined process.
   */
  async executeTasks(type: ExecuteType): Promise<ExecuteQueue<ScriptContext>> {
    return Promise.resolve({
      tasks: this.tasks,
      type,
    });
  }

  /**
   * Define an individual task that will be piped to an upstream routine.
   */
  task(title: string, action: TaskAction<ScriptContext>): Task<ScriptContext> {
    if (typeof action !== 'function') {
      // TODO
      // throw new TypeError(this.tool.msg('errors:taskRequireAction'));
    }

    const task = new Task(title, action);

    this.tasks.push(task);

    return task;
  }
}
