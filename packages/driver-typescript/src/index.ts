/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { TypeScriptDriver } from './TypeScriptDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function typeScriptDriver(options?: DriverOptions) {
	return new TypeScriptDriver(options);
}
