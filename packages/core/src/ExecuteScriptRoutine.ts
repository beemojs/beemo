/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import { ModuleLoader, Routine } from '@boost/core';
import parseArgs from 'yargs-parser';
import Script from './Script';
import ScriptContext from './contexts/ScriptContext';
import { BeemoTool, Execution } from './types';

export default class ExecuteScriptRoutine extends Routine<ScriptContext, BeemoTool> {
  async execute(context: ScriptContext): Promise<Execution> {
    this.task(this.tool.msg('app:scriptLoad'), this.loadScript);
    this.task(this.tool.msg('app:scriptRun'), this.runScript);

    return this.serializeTasks();
  }

  /**
   * Attempt to load a script from the configuration module.
   */
  async loadScript(context: ScriptContext): Promise<Script> {
    const filePath = path.join(context.moduleRoot, 'scripts', `${context.scriptName}.js`);
    const loader = new ModuleLoader(this.tool, 'script', Script);

    this.debug('Loading script');

    const script = loader.importModule(filePath, [
      context.scriptName,
      this.tool.msg('app:scriptRunNamed', { name: context.scriptName }),
    ]);

    // Pass context and tool to script
    script.configure(this);

    // Set script into context
    context.setScript(script, filePath);

    this.tool.emit(`${context.eventName}.load-script`, [context, script]);

    return script;
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  async runScript(context: ScriptContext, script: Script): Promise<Execution> {
    const { argv } = this.context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    this.tool.emit(`${context.eventName}.before-execute`, [context, argv, script]);

    const args = parseArgs(argv, script.args());
    let result = null;

    try {
      result = await script.execute(context, args);

      this.tool.emit(`${context.eventName}.after-execute`, [context, result, script]);
    } catch (error) {
      this.tool.emit(`${context.eventName}.failed-execute`, [context, error, script]);

      throw error;
    }

    return result;
  }
}
