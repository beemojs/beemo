import Context from './Context';
import Script from '../Script';
import { Arguments } from '../types';

export interface ScriptArgs {
  concurrency: number;
  name: string;
  priority: boolean;
  workspaces: string;
}

export default class ScriptContext<T = ScriptArgs> extends Context<T> {
  // Name used for emitting events (kebab case)
  eventName: string;

  // Absolute path to the script (changes depending on source location)
  path: string = '';

  // Script instance
  script: Script | null = null;

  // Name passed on the command line and the plugin name (kebab case)
  scriptName: string;

  constructor(args: Arguments<T>, name: string) {
    super(args);

    this.scriptName = name;
    this.eventName = name;
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
