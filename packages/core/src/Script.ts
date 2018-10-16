/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Tool } from '@boost/core';
import { Arguments, Options } from 'yargs-parser';

export default class Script {
  name: string = '';

  /**
   * Define a configuration object to parse args with.
   */
  parse(): Options {
    return {};
  }

  /**
   * Run the script with the options object and Beemo tool instance.
   */
  async run(args: Arguments, tool: Tool): Promise<any> {
    throw new Error(`${this.constructor.name} must define an async run() method.`);
  }
}
