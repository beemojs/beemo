/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { TypeScriptOptions } from './types';
import { TypeScriptDriver } from './TypeScriptDriver';

export * from './types';

export default function typeScriptDriver(options?: TypeScriptOptions) {
	return new TypeScriptDriver(options);
}
