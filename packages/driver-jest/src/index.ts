/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import JestDriver from './JestDriver';

export * from './types';

export default function jestDriver(options?: DriverOptions) {
  return new JestDriver(options);
}
