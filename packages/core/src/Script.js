/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Module } from 'boost';

import type { BeemoTool } from './types';

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
  run(options: Object, tool: BeemoTool): Promise<*> {
    throw new Error(`${this.constructor.name} must define a run() method.`);
  }
}
