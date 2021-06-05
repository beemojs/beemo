/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { PrettierDriver } from './PrettierDriver';

export * from './types';

export default function prettierDriver(options?: DriverOptions) {
	return new PrettierDriver(options);
}
