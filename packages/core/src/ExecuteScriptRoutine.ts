/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import { ModuleLoader, Routine } from 'boost';
import parseArgs from 'yargs-parser';
import Script from './Script';
import { BeemoConfig, Execution, ScriptContext } from './types';

export default class ExecuteScriptRoutine extends Routine<BeemoConfig, ScriptContext> {
  // @ts-ignore Debug generic value from parent
  execute(context: ScriptContext, scriptName: string): Promise<Execution> {
    this.task('Loading script', this.loadScript);
    this.task('Running script', this.runScript);

    return this.serializeTasks(scriptName);
  }

  /**
   * Attempt to load a script from the configuration module.
   */
  loadScript(context: ScriptContext, scriptName: string): Promise<Script> {
    const filePath = path.join(context.moduleRoot, 'scripts', `${scriptName}.js`);
    const loader = new ModuleLoader(this.tool, 'script', Script);

    this.tool.debug('Loading script');

    return new Promise(resolve => {
      const script = loader.importModule(filePath);

      // Is not set by Boost, so set it here
      script.name = scriptName;

      context.script = script;
      context.scriptName = scriptName;
      context.scriptPath = filePath;

      this.tool.emit('load-script', [script]);

      resolve(script);
    });
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  runScript(context: ScriptContext, script: Script): Promise<Execution> {
    const { argsList } = this.context;

    this.tool.debug('Executing script with args "%s"', argsList.join(' '));

    this.tool.emit('before-execute', [script, argsList, context]);

    const args = parseArgs(argsList, script.parse());

    return Promise.resolve(script.run(args, this.tool))
      .then(response => {
        this.tool.emit('after-execute', [script, response]);

        return response;
      })
      .catch(error => {
        this.tool.emit('failed-execute', [script, error]);

        throw error;
      });
  }
}
