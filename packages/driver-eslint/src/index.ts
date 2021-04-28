/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { ESLintDriver } from './ESLintDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function eslintDriver(options?: DriverOptions) {
  return new ESLintDriver(options);
}
