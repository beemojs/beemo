import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { PathResolver } from '@boost/common';
import formatModuleName from '@boost/core/lib/helpers/formatModuleName';
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
    this.task(this.tool.msg('app:scriptLoadModule'), this.loadScriptFromModule);
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
          packageRoot: cwd.path(),
        }),
      );
    }
  }

  /**
   * If the script has been loaded into the tool, return that directly.
   * Scripts can be preloaded from a configuration file or the command line.
   */
  loadScriptFromTool(context: ScriptContext): Script | null {
    this.debug('Attempting to load script from tool');

    try {
      const script = this.tool.getPlugin('script', context.scriptName);

      context.setScript(script, script.moduleName);

      return script;
    } catch (error) {
      error.message = this.tool.msg('app:fromTool', { message: error.message });

      this.errors.push(error);

      return null;
    }
  }

  /**
   * Attempt to load a script from the configuration module's `scripts/` folder,
   * or a standard Node modules folder.
   */
  loadScriptFromModule(context: ScriptContext, script: Script | null): Script | null {
    if (script) {
      return script;
    }

    this.debug('Attempting to load script from configuration module or node module');

    const moduleName = this.tool.config.module;
    const fileName = upperFirst(camelCase(context.scriptName));
    const resolver = new PathResolver();

    if (moduleName === '@local') {
      resolver
        .lookupFilePath(`lib/scripts/${fileName}.js`, context.moduleRoot)
        .lookupFilePath(`scripts/${fileName}.js`, context.moduleRoot);
    } else {
      resolver
        .lookupNodeModule(`${moduleName}/lib/scripts/${fileName}`)
        .lookupNodeModule(`${moduleName}/scripts/${fileName}`)
        .lookupNodeModule(formatModuleName('beemo', 'script', context.scriptName, true))
        .lookupNodeModule(formatModuleName('beemo', 'script', context.scriptName));
    }

    try {
      const { originalPath, resolvedPath } = resolver.resolve();

      script = this.tool.getRegisteredPlugin('script').loader.importModule(resolvedPath);
      script.name = context.scriptName;
      script.moduleName = originalPath.path();

      context.setScript(script, resolvedPath.path());
    } catch (error) {
      error.message = this.tool.msg('app:fromModule', { message: error.message });

      this.errors.push(error);
    }

    return script || null;
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
