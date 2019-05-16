import path from 'path';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import Script from '../Script';
import ScriptContext from '../contexts/ScriptContext';
import filterArgs from '../utils/filterArgs';
import { EXECUTE_OPTIONS } from '../constants';
import ExecuteScriptRoutine from './script/ExecuteScriptRoutine';
import RunInWorkspacesRoutine from './RunInWorkspacesRoutine';

export default class RunScriptRoutine extends RunInWorkspacesRoutine<ScriptContext> {
  errors: Error[] = [];

  bootstrap() {
    super.bootstrap();

    this.task(this.tool.msg('app:scriptLoad'), this.loadScriptFromTool);
    this.task(this.tool.msg('app:scriptLoadConfigModule'), this.loadScriptFromConfigModule);
    this.task(this.tool.msg('app:scriptLoadNodeModules'), this.loadScriptFromNodeModules);
    this.task(this.tool.msg('app:scriptLoadPost'), this.postLoad);
  }

  pipeRoutine(packageName: string, packageRoot: string) {
    const { argv, cwd, scriptName } = this.context;
    const { filteredArgv } = filterArgs(argv, {
      block: EXECUTE_OPTIONS,
    });
    const command = filteredArgv.join(' ');

    if (packageName) {
      this.pipe(
        new ExecuteScriptRoutine(packageName, command, {
          packageRoot,
        }),
      );
    } else {
      this.pipe(
        new ExecuteScriptRoutine(scriptName, command, {
          packageRoot: cwd,
        }),
      );
    }
  }

  /**
   * Return node module file path for the passed script.
   */
  getModulePath(script: Script): string {
    // Cannot mock require.resolve in Jest
    return process.env.NODE_ENV === 'test' ? script.moduleName : require.resolve(script.moduleName);
  }

  /**
   * If the script has been loaded into the tool, return that directly.
   * Scripts can be preloaded from a configuration file or the command line.
   */
  loadScriptFromTool(context: ScriptContext): Script | null {
    this.debug('Attempting to load script from tool');

    try {
      const script = this.tool.getPlugin('script', context.scriptName);

      context.setScript(script, this.getModulePath(script));

      return script;
    } catch (error) {
      error.message = this.tool.msg('app:fromTool', { message: error.message });

      this.errors.push(error);

      return null;
    }
  }

  /**
   * Attempt to load a script from the configuration module's `scripts/` folder.
   */
  loadScriptFromConfigModule(context: ScriptContext, script: Script | null): Script | null {
    if (script) {
      return script;
    }

    this.debug('Attempting to load script from configuration module');

    const fileName = upperFirst(camelCase(context.scriptName));
    const filePath = path.join(context.moduleRoot, 'scripts', `${fileName}.js`);

    try {
      script = this.tool.getRegisteredPlugin('script').loader.importModule(filePath);
      script.name = context.scriptName;

      context.setScript(script, filePath);

      return script;
    } catch (error) {
      error.message = this.tool.msg('app:fromConfigModule', { message: error.message });

      this.errors.push(error);

      return null;
    }
  }

  /**
   * Attempt to load a script from the local `node_modules/` folder.
   */
  loadScriptFromNodeModules(context: ScriptContext, script: Script | null): Script | null {
    if (script) {
      return script;
    }

    this.debug('Attempting to load script from local node modules');

    try {
      script = this.tool.getRegisteredPlugin('script').loader.importModule(context.scriptName);

      context.setScript(script, this.getModulePath(script));

      return script;
    } catch (error) {
      error.message = this.tool.msg('app:fromNodeModules', { message: error.message });

      this.errors.push(error);

      return null;
    }
  }

  /**
   * If all of the loading patterns have failed, thrown an error,
   * otherwise add the script and continue.
   */
  postLoad(context: ScriptContext, script: Script | null): Script {
    if (!script) {
      const messages = this.errors.map(error => `  - ${error.message}`).join('\n');

      throw new Error(`Failed to load script from multiple sources:\n${messages}`);
    }

    this.tool.addPlugin('script', script);

    return script;
  }
}
