/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Context as BaseContext } from 'boost';
import camelCase from 'lodash/camelCase';
import trim from 'lodash/trim';
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

  /**
   * Add an arg to both the args object and argv list.
   */
  addArg(arg: string, defaultValue: any = null) {
    this.argv.push(arg);

    // Positional argument
    if (!arg.startsWith('-')) {
      this.args._.push(arg);

      return;
    }

    let name = trim(arg, '-');
    let value = defaultValue;

    if (name.includes('=')) {
      [name, value] = name.split('=');
    }

    this.args[name] = value;
    this.args[camelCase(name)] = value;
  }

  /**
   * Return an arguments value by name, or a fallback value if not found.
   */
  getArg<T>(name: string, fallback: any = null): T {
    return this.args[name] || fallback;
  }
}
