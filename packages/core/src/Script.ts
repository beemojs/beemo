import execa, { Options as ExecaOptions } from 'execa';
import { Arguments, ParserOptions } from '@boost/args';
import { Blueprint, Predicates } from '@boost/common';
import { ConcurrentEvent } from '@boost/event';
import { Plugin } from '@boost/plugin';
import ScriptContext from './contexts/ScriptContext';
import isClassInstance from './helpers/isClassInstance';
import { Argv, BeemoTool, Scriptable } from './types';

export default abstract class Script<O extends object = {}, Options extends object = {}>
  extends Plugin<BeemoTool, Options>
  implements Scriptable<O> {
  // Set within a life-cycle
  tool!: BeemoTool;

  readonly onBeforeExecute = new ConcurrentEvent<[ScriptContext, Argv]>('before-execute');

  readonly onAfterExecute = new ConcurrentEvent<[ScriptContext, unknown]>('after-execute');

  readonly onFailedExecute = new ConcurrentEvent<[ScriptContext, Error]>('failed-execute');

  static validate(script: Script) {
    const name = (isClassInstance(script) && script.constructor.name) || 'Script';

    if (typeof script.parse !== 'function') {
      throw new TypeError(`\`${name}\` requires a \`parse()\` method.`);
    }

    if (typeof script.execute !== 'function') {
      throw new TypeError(`\`${name}\` requires an \`execute()\` method.`);
    }
  }

  blueprint(preds: Predicates): Blueprint<object> {
    return {};
  }

  bootstrap() {}

  startup(tool: BeemoTool) {
    this.tool = tool;
    this.bootstrap();
  }

  /**
   * Define a configuration object to parse args with.
   */
  parse(): ParserOptions<O> {
    return {
      // @ts-expect-error Allow this
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
  abstract execute(context: ScriptContext, args: Arguments<O>): Promise<unknown>;
}
