/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import { ModuleLoader, Routine } from '@boost/core';
import parseArgs from 'yargs-parser';
import Script from './Script';
import ScriptContext from './contexts/ScriptContext';
import { BeemoTool, Execution } from './types';

export default class ExecuteScriptRoutine extends Routine<ScriptContext, BeemoTool> {
  async execute(context: ScriptContext, scriptName: any): Promise<Execution> {
    this.task(this.tool.msg('app:scriptLoad'), this.loadScript);
    this.task(this.tool.msg('app:scriptRun'), this.runScript);

    return this.serializeTasks(scriptName);
  }

  /**
   * Attempt to load a script from the configuration module.
   */
  async loadScript(context: ScriptContext, scriptName: string): Promise<Script> {
    const filePath = path.join(context.moduleRoot, 'scripts', `${scriptName}.js`);
    const loader = new ModuleLoader(this.tool, 'script', Script);

    this.debug('Loading script');

    const script = loader.importModule(filePath);

    // Is not set by Boost, so set it here
    script.name = scriptName;

    context.setScript(script, filePath);

    this.tool.emit(`${scriptName}.load-script`, [script]);

    return script;
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  async runScript(context: ScriptContext, script: Script): Promise<Execution> {
    const { argv } = this.context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    this.tool.emit(`${script.name}.before-execute`, [script, argv, context]);

    const args = parseArgs(argv, script.parse());
    let result = null;

    try {
      result = await script.run(args, this.tool);

      this.tool.emit(`${script.name}.after-execute`, [script, result]);
    } catch (error) {
      this.tool.emit(`${script.name}.failed-execute`, [script, error]);

      throw error;
    }

    return result;
  }
}
