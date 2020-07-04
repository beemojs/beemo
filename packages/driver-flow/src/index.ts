/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import FlowDriver from './FlowDriver';

export * from './types';

export default function flowDriver(options?: DriverOptions) {
  return new FlowDriver(options);
}
