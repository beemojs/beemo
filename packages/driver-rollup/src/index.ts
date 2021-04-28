/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { RollupDriver } from './RollupDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function rollupDriver(options?: DriverOptions) {
  return new RollupDriver(options);
}
