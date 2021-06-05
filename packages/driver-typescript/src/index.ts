/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { TypeScriptDriver } from './TypeScriptDriver';

export * from './types';

export default function typeScriptDriver(options?: DriverOptions) {
	return new TypeScriptDriver(options);
}
