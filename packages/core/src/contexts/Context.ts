/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Context as BaseContext } from '@boost/core';
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
   * Add a positional argument to the argv list.
   */
  addArg(arg: string): this {
    this.args._.push(arg);
    this.argv.push(arg);

    return this;
  }

  /**
   * Add multiple positional arguments.
   */
  addArgs(args: string[]): this {
    args.forEach(arg => {
      this.addArg(arg);
    });

    return this;
  }

  /**
   * Add an option argument to both the args object and argv list.
   */
  addOption(arg: string, defaultValue: any = true, useEquals: boolean = false): this {
    const list = [];
    let option = arg;
    let value = defaultValue;

    if (option.includes('=')) {
      [option, value] = option.split('=');
      useEquals = true;
    }

    let name = trim(option, '-');

    if (name.startsWith('no-')) {
      name = name.slice(3);
      value = false;
    }

    this.args[name] = value;
    this.args[camelCase(name)] = value;

    if (typeof value === 'boolean' || !value) {
      list.push(option);
    } else if (useEquals) {
      list.push(`${option}=${value}`);
    } else {
      list.push(option, String(value));
    }

    this.argv.push(...list);

    return this;
  }

  /**
   * Add multiple boolean option arguments.
   */
  addOptions(args: string[]): this {
    args.forEach(arg => {
      this.addOption(arg);
    });

    return this;
  }

  /**
   * Return an argument or option value by name, or a fallback value if not found.
   */
  getArg<T>(name: string, fallback: any = null): T {
    return this.args[name] || fallback;
  }
}
