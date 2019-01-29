/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import camelCase from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';
import upperFirst from 'lodash/upperFirst';
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
  binName: string;

  eventName: string;

  path: string = '';

  script: Script | null = null;

  scriptName: string;

  constructor(args: Arguments<T>, name: string) {
    super(args);

    this.binName = kebabCase(name);
    this.eventName = kebabCase(name);
    this.scriptName = upperFirst(camelCase(name));
  }

  /**
   * Set the script object and associated metadata.
   */
  setScript(script: Script, path: string): this {
    this.script = script;
    this.scriptName = upperFirst(camelCase(script.name));
    this.path = path;

    return this;
  }
}
