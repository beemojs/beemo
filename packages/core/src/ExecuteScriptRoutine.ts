/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import { Routine, Task } from '@boost/core';
import parseArgs from 'yargs-parser';
import Script from './Script';
import ScriptContext from './contexts/ScriptContext';
import { BeemoTool, ExecuteType } from './types';

export default class ExecuteScriptRoutine extends Routine<ScriptContext, BeemoTool> {
  bootstrap() {
    this.task(this.tool.msg('app:scriptLoad'), this.loadScript);
    this.task(this.tool.msg('app:scriptRun'), this.runScript);
  }

  execute(): Promise<any> {
    return this.serializeTasks();
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

  /**
   * Run the script while also parsing arguments to use as options.
   */
  async runScript(context: ScriptContext, script: Script): Promise<any> {
    const { argv } = this.context;

    this.debug('Executing script with args "%s"', argv.join(' '));

    this.tool.emit(`${context.eventName}.before-execute`, [context, argv, script]);

    const args = parseArgs(argv, script.args());
    let result = null;

    try {
      result = await script.execute(context, args);

      if (typeof result === 'object' && result && result.type && Array.isArray(result.tasks)) {
        result = await this.runScriptTasks(args, result.type, result.tasks);
      }

      this.tool.emit(`${context.eventName}.after-execute`, [context, result, script]);
    } catch (error) {
      this.tool.emit(`${context.eventName}.failed-execute`, [context, error, script]);

      throw error;
    }

    return result;
  }

  /**
   * Run the tasks the script enqueued using the defined process.
   */
  async runScriptTasks(args: any, type: ExecuteType, tasks: Task<any>[]): Promise<any> {
    // Add the tasks to the routine so they show in the console
    this.tasks.push(...tasks);

    switch (type) {
      case 'parallel':
        return this.parallelizeTasks(args, tasks);
      case 'pool':
        return this.poolTasks(args, {}, tasks);
      case 'serial':
        return this.serializeTasks(args, tasks);
      case 'sync':
        return this.synchronizeTasks(args, tasks);
      default:
        throw new Error(`Unknown execution type "${type}"`);
    }
  }
}
