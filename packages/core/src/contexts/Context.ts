/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Context as BaseContext } from 'boost';
import { Arguments, Argv } from '../types';

export default class Context extends BaseContext {
  args: Arguments;

  argv: Argv = [];

  moduleRoot: string = '';

  root: string = '';

  constructor(args: Arguments) {
    super();

    this.args = args;
  }

  addArg() {}

  /**
   * Return an arguments value by name, or a fallback value if not found.
   */
  getArg<T>(name: string, fallback: any = null): T {
    return this.args[name] || fallback;
  }
}
