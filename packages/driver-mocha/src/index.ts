/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { MochaDriver } from './MochaDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function mochaDriver(options?: DriverOptions) {
  return new MochaDriver(options);
}
