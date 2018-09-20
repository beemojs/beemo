/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import { Arguments } from '../types';

export default class ScaffoldContext extends Context {
  action: string;

  generator: string;

  constructor(args: Arguments, generator: string, action: string) {
    super(args);

    this.generator = generator;
    this.action = action;
  }
}
