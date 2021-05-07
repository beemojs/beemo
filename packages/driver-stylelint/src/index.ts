/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { StylelintDriver } from './StylelintDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function stylelintDriver(options?: DriverOptions) {
  return new StylelintDriver(options);
}
