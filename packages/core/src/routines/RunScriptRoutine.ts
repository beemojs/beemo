/* eslint-disable @typescript-eslint/member-ordering */

import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { Bind, instanceOf, PathResolver } from '@boost/common';
import { EXECUTE_OPTIONS } from '../constants';
import { ScriptContext } from '../contexts/ScriptContext';
import { filterArgs } from '../helpers/filterArgs';
import { Script } from '../Script';
import { RunInWorkspacesRoutine } from './RunInWorkspacesRoutine';
import { ExecuteScriptRoutine } from './script/ExecuteScriptRoutine';

export class RunScriptRoutine extends RunInWorkspacesRoutine<ScriptContext> {
	errors: Error[] = [];

	async getInitialValue(context: ScriptContext): Promise<Script> {
		const { tool } = this.options;

		return this.createWaterfallPipeline(context)
			.pipe(tool.msg('app:scriptLoad'), this.loadScriptFromTool)
			.pipe(tool.msg('app:scriptLoadModule'), this.loadScriptFromModule)
			.pipe(tool.msg('app:scriptLoadPost'), this.postLoad)
			.run();
	}

	pipeRoutine(context: ScriptContext, packageName: string, packageRoot: string): void {
		const { argv, cwd, scriptName } = context;
		const { filteredArgv } = filterArgs(argv, {
			block: EXECUTE_OPTIONS,
		});
		const command = filteredArgv.join(' ');

		if (packageName) {
			this.routines.push(
				new ExecuteScriptRoutine(packageName, command, {
					packageRoot,
					tool: this.options.tool,
				}),
			);
		} else {
			this.routines.push(
				new ExecuteScriptRoutine(scriptName, command, {
					packageRoot: cwd.path(),
					tool: this.options.tool,
				}),
			);
		}
	}

	/**
	 * If the script has been loaded into the tool, return that directly.
	 * Scripts can be preloaded from a configuration file or the command line.
	 */
	@Bind()
	loadScriptFromTool(context: ScriptContext): Script | null {
		this.debug('Attempting to load script from tool');

		try {
			const script = this.options.tool.scriptRegistry.get(context.scriptName);

			context.setScript(script);

			return script;
		} catch (error: unknown) {
			if (instanceOf(error, Error)) {
				this.errors.push(
					new Error(this.options.tool.msg('app:fromTool', { message: error.message })),
				);
			}

			return null;
		}
	}

	/**
	 * Attempt to load a script from the configuration module's `scripts/` folder,
	 * or a standard Node modules folder.
	 */
	@Bind()
	async loadScriptFromModule(
		context: ScriptContext,
		script: Script | null,
	): Promise<Script | null> {
		if (script) {
			return script;
		}

		this.debug('Attempting to load script from configuration module or node module');

		const { tool } = this.options;
		const moduleName = tool.config.module;
		const fileName = upperFirst(camelCase(context.scriptName));
		const resolver = new PathResolver();

		if (moduleName === '@local') {
			const root = context.configModuleRoot;

			resolver
				.lookupFilePath(`scripts/${fileName}.ts`, root)
				.lookupFilePath(`scripts/${fileName}.js`, root)
				.lookupFilePath(`src/scripts/${fileName}.ts`, root)
				.lookupFilePath(`lib/scripts/${fileName}.js`, root);
		} else {
			resolver
				.lookupNodeModule(`${moduleName}/scripts/${fileName}.ts`)
				.lookupNodeModule(`${moduleName}/scripts/${fileName}.js`)
				.lookupNodeModule(`${moduleName}/src/scripts/${fileName}.ts`)
				.lookupNodeModule(`${moduleName}/lib/scripts/${fileName}.js`)
				.lookupNodeModule(tool.scriptRegistry.formatModuleName(context.scriptName, true))
				.lookupNodeModule(tool.scriptRegistry.formatModuleName(context.scriptName));
		}

		try {
			const { resolvedPath } = resolver.resolve();
			const loadedScript = await tool.scriptRegistry.load(resolvedPath.path());

			context.setScript(loadedScript);

			return loadedScript;
		} catch (error: unknown) {
			if (instanceOf(error, Error)) {
				this.errors.push(new Error(tool.msg('app:fromModule', { message: error.message })));
			}

			return null;
		}
	}

	/**
	 * If all of the loading patterns have failed, thrown an error,
	 * otherwise add the script and continue.
	 */
	@Bind()
	postLoad(context: ScriptContext, script: Script | null): Script {
		if (!script) {
			const messages = this.errors.map((error) => `  - ${error.message}`).join('\n');

			throw new Error(`Failed to load script from multiple sources:\n${messages}`);
		}

		void this.options.tool.scriptRegistry.load(script);

		return script;
	}
}
