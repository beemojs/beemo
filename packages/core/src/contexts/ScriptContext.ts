import Context from './Context';
import Script from '../Script';
import { Arguments, StdioType } from '../types';

export interface ScriptArgs {
  concurrency: number;
  graph: boolean;
  name: string;
  stdio: StdioType;
  workspaces: string;
}

export default class ScriptContext<T = ScriptArgs> extends Context<T> {
  // Absolute path to the script (changes depending on source location)
  path: string = '';

  // Script instance
  script: Script | null = null;

  // Name passed on the command line and the plugin name (kebab case)
  scriptName: string;

  constructor(args: Arguments<T>, name: string) {
    super(args);

    this.scriptName = name;
  }

  /**
   * Set the script object and associated metadata.
   */
  setScript(script: Script, path: string): this {
    this.script = script;
    this.path = path;

    return this;
  }
}
