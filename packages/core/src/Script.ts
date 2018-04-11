/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Module, ToolInterface } from 'boost';
import { Options, Arguments } from 'yargs';

export default class Script extends Module<{}> {
  /**
   * Define a configuration object to parse args with.
   */
  parse(): { [option: string]: Options } {
    return {};
  }

  /**
   * Run the script with the options object and Beemo tool instance.
   */
  run(options: Arguments, tool: ToolInterface): Promise<any> {
    throw new Error(`${this.constructor.name} must define a run() method.`);
  }
}
