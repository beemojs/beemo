/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import { ModuleLoader, Routine } from 'boost';
import parseArgs from 'yargs-parser';
import Script from './Script';
import ScriptContext from './contexts/ScriptContext';
import { BeemoConfig, Execution } from './types';

export default class ExecuteScriptRoutine extends Routine<ScriptContext, BeemoConfig> {
  execute(context: ScriptContext, scriptName: any): Promise<Execution> {
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

    this.debug('Loading script');

    return new Promise(resolve => {
      const script = loader.importModule(filePath);

      // Is not set by Boost, so set it here
      script.name = scriptName;

      context.setScript(script, filePath);

      this.tool.emit('load-script', [script]);

      resolve(script);
    });
  }

  /**
   * Run the script while also parsing arguments to use as options.
   */
  runScript(context: ScriptContext, script: Script): Promise<Execution> {
    const { argv } = this.context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    this.tool.emit('before-execute', [script, argv, context]);

    const args = parseArgs(argv, script.parse());

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
