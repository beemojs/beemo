/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import { Arguments } from '../types';

export interface ScaffoldArgs {
  action: string;
  generator: string;
  dry: boolean;
}

export default class ScaffoldContext<T = ScaffoldArgs> extends Context<T> {
  action: string;

  generator: string;

  constructor(args: Arguments<T>, generator: string, action: string) {
    super(args);

    this.generator = generator;
    this.action = action;
  }
}
