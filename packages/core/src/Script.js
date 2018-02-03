/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Module } from 'boost';

import type { Tool, Reporter } from 'boost';
import type Driver from './Driver';

export default class Script extends Module<Object> {
  /**
   * Define a configuration object to parse args with.
   */
  parse(): Object {
    return {};
  }

  /**
   * Run the script with the options object and Beemo tool instance.
   */
  run(options: Object, tool: Tool<Driver, Reporter<Object>>): Promise<*> {
    throw new Error(`${this.constructor.name} must define a run() method.`);
  }
}
