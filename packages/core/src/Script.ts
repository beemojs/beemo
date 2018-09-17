/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Module, Tool } from '@boost/core';
import { Options, Arguments } from 'yargs';

export default class Script<Opts = {}> extends Module<Opts> {
  /**
   * Define a configuration object to parse args with.
   */
  parse(): { [option: string]: Options } {
    return {};
  }

  /**
   * Run the script with the options object and Beemo tool instance.
   */
  async run(args: Arguments, tool: Tool): Promise<any> {
    throw new Error(`${this.constructor.name} must define an async run() method.`);
  }
}
