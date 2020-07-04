/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import WebpackDriver from './WebpackDriver';

export * from './types';

export default function webpackDriver(options?: DriverOptions) {
  return new WebpackDriver(options);
}
