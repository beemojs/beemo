/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { BabelDriver } from './BabelDriver';

export type { BabelDriver };
export * from './types';

export default function babelDriver(options?: DriverOptions) {
	return new BabelDriver(options);
}
