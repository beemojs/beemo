/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import Script from '../Script';

export default class ScriptContext extends Context {
  script: Script | null = null;

  scriptName: string = '';

  scriptPath: string = '';

  setScript(script: Script, path: string) {
    this.script = script;
    this.scriptName = script.name;
    this.scriptPath = path;
  }
}
