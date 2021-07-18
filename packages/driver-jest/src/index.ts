/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { JestDriver } from './JestDriver';

export type { JestDriver };
export * from './types';

export default function jestDriver(options?: DriverOptions) {
	return new JestDriver(options);
}
