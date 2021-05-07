/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { JestDriver } from './JestDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function jestDriver(options?: DriverOptions) {
  return new JestDriver(options);
}
