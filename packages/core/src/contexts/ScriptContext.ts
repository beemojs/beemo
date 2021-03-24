import { Script } from '../Script';
import { Arguments } from '../types';
import { Context } from './Context';

export interface ScriptContextOptions {
	concurrency: number;
	graph: boolean;
	workspaces: string;
}

export type ScriptContextParams = [string];

export class ScriptContext extends Context<ScriptContextOptions, ScriptContextParams> {
	// Script instance
	script: Script | null = null;

	// Name passed on the command line and the plugin name (kebab case)
	scriptName: string;

	constructor(args: Arguments<ScriptContextOptions, ScriptContextParams>, name: string) {
		super(args);

		this.scriptName = name;
	}

	/**
	 * Set the script object and associated metadata.
	 */
	setScript(script: Script): this {
		this.script = script;

		return this;
	}
}
