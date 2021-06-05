/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { MochaDriver } from './MochaDriver';

export * from './types';

export default function mochaDriver(options?: DriverOptions) {
	return new MochaDriver(options);
}
