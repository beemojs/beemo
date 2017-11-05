/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Plugin } from 'boost';

export default class Engine extends Plugin {
  merge(prev: Object, next: Object): Object {
    throw new Error('Merging strategy has not been defined.');
  }
}
