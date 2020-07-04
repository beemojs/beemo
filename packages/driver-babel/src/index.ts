/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import BabelDriver from './BabelDriver';

export * from './types';

export default function babelDriver(options?: DriverOptions) {
  return new BabelDriver(options);
}
