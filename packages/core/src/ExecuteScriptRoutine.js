/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import path from 'path';
import { ModuleLoader, Routine } from 'boost';
import parseArgs from 'yargs-parser';
import Script from './Script';

import type { BeemoConfig, Execution, ScriptContext } from './types';

export default class ExecuteScriptRoutine extends Routine<BeemoConfig, ScriptContext> {
  execute(scriptName: string): Promise<string[]> {
    this.task('Loading script', this.loadScript);
    this.task('Running script', this.runScript);

    return this.serializeTasks(scriptName);
  }

  /**
   * Attempt to load a script from the configuration module.
   */
  loadScript(scriptName: string): Promise<Script> {
    const filePath = path.join(this.context.moduleRoot, 'scripts', `${scriptName}.js`);
    const loader = new ModuleLoader(this.tool, 'script', Script);

    this.tool.debug('Loading script');

    return new Promise(resolve => {
      const script = loader.importModule(filePath);

      // Is not set by Boost, so set it here
      script.name = scriptName;

      this.context.script = script;
      this.context.scriptName = scriptName;
      this.context.scriptPath = filePath;

      resolve(script);
    });
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  runScript(script: Script): Promise<Execution> {
    const { args, yargs } = this.context;

    this.tool.debug(`Executing script with args "${args.join(' ')}"`);

    this.tool.emit('execute-script', [script, args, yargs]);

    const options = parseArgs(args, script.parse());

    return Promise.resolve(script.run(options, this.tool))
      .then(response => {
        this.tool.emit('successful-script', [script, response]);

        return response;
      })
      .catch(error => {
        this.tool.emit('failed-script', [script, error]);

        throw error;
      });
  }
}
