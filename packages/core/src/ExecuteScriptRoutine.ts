/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import Script from './Script';
import ScriptContext from './contexts/ScriptContext';
import RunScriptRoutine from './execute/RunScriptRoutine';
import BaseExecuteRoutine from './BaseExecuteRoutine';

export default class ExecuteScriptRoutine extends BaseExecuteRoutine<ScriptContext> {
  async execute(context: ScriptContext): Promise<any[]> {
    const response = await this.synchronizeRoutines(this.loadScript(context));

    if (response.errors.length > 0) {
      this.formatAndThrowErrors(response.errors);
    }

    return response.results;
  }

  /**
   * Attempt to load a script from the configuration module.
   */
  loadScript(context: ScriptContext): Script {
    const { loader } = this.tool.getRegisteredPlugin('script');
    let script: Script;

    // Try file path in configuration module
    try {
      this.debug('Loading script from configuration module');

      const filePath = path.join(context.moduleRoot, 'scripts', `${context.scriptName}.js`);

      script = loader.importModule(filePath);
      script.name = context.scriptName;

      context.setScript(script, filePath);
    } catch (error1) {
      // Try an NPM module
      try {
        this.debug('Loading script from NPM module');

        script = loader.importModule(context.eventName); // Module names are kebab case

        context.setScript(
          script,
          // Cannot mock require.resolve in Jest
          process.env.NODE_ENV === 'test' ? script.moduleName : require.resolve(script.moduleName),
        );
      } catch (error2) {
        throw new Error(
          [
            'Failed to load script, the following errors occurred:',
            error1.message,
            error2.message,
          ].join('\n'),
        );
      }
    }

    this.tool.addPlugin('script', script);

    this.tool.emit(`${context.eventName}.load-script`, [context, script]);

    return script;
  }

  pipeRoutine() {
    const { argv, binName, root, scriptName } = this.context;

    this.pipe(
      new RunScriptRoutine(scriptName, `${binName} ${argv.join(' ')}`, {
        packageRoot: root,
      }),
    );
  }

  pipeWorkspaceRoutine(packageName: string, packageRoot: string) {
    const { argv, binName } = this.context;

    this.pipe(
      new RunScriptRoutine(packageName, `${binName} ${argv.join(' ')}`, {
        packageRoot,
      }),
    );
  }
}
