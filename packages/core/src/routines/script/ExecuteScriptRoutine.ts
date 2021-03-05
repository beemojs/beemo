import { parse } from '@boost/args';
import { Blueprint, Path, Predicates } from '@boost/common';
import { Routine } from '@boost/pipeline';
import ScriptContext from '../../contexts/ScriptContext';
import formatExecReturn, { ExecLike } from '../../helpers/formatExecReturn';
import Script from '../../Script';
import type Tool from '../../Tool';
import { RoutineOptions } from '../../types';

export interface ExecuteScriptOptions extends RoutineOptions {
  packageRoot?: string;
}

export default class ExecuteScriptRoutine extends Routine<unknown, Script, ExecuteScriptOptions> {
  blueprint({ instance, string }: Predicates): Blueprint<ExecuteScriptOptions> {
    return {
      packageRoot: string(),
      tool: instance<Tool>().required().notNullable(),
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

    // Update the cwd to point to the package root
    if (this.options.packageRoot) {
      context.cwd = new Path(this.options.packageRoot);
    }

    const { argv } = context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    await script.onBeforeExecute.emit([context, argv]);

    const args = parse(argv, script.parse());
    let result;

    try {
      result = await script.execute(context, args);

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
}
