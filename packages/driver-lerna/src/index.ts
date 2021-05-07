/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { LernaDriver } from './LernaDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function lernaDriver(options?: DriverOptions) {
  return new LernaDriver(options);
}
