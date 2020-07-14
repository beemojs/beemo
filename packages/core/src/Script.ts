import { ParserOptions, Arguments } from '@boost/args';
import { ConcurrentEvent } from '@boost/event';
import { Plugin } from '@boost/plugin';
import execa, { Options as ExecaOptions } from 'execa';
import ScriptContext from './contexts/ScriptContext';
import { Argv, Scriptable, BeemoTool } from './types';

export default abstract class Script<O extends object = {}, Options extends object = {}>
  extends Plugin<BeemoTool, Options>
  implements Scriptable<O> {
  readonly onBeforeExecute = new ConcurrentEvent<[ScriptContext, Argv]>('before-execute');

  readonly onAfterExecute = new ConcurrentEvent<[ScriptContext, unknown]>('after-execute');

  readonly onFailedExecute = new ConcurrentEvent<[ScriptContext, Error]>('failed-execute');

  static validate(script: Script) {
    if (typeof script.parse !== 'function') {
      throw new TypeError('`Script`s require an `parse()` method.');
    }

    if (typeof script.execute !== 'function') {
      throw new TypeError('`Script`s require an `execute()` method.');
    }
  }

  /**
   * Define a configuration object to parse args with.
   */
  parse(): ParserOptions<O> {
    return {
      // @ts-ignore Allow this
      options: {},
    };
  }

  /**
   * Execute a command with the given arguments and pass the results through a promise.
   */
  async executeCommand(command: string, args: string[], options: ExecaOptions = {}) /* infer */ {
    return execa(command, args, options);
  }

  /**
   * Execute the script with the context and parsed args.
   */
  abstract async execute(context: ScriptContext, args: Arguments<O>): Promise<unknown>;
}
