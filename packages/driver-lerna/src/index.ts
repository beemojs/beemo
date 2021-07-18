/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { LernaDriver } from './LernaDriver';

export type { LernaDriver };
export * from './types';

export default function lernaDriver(options?: DriverOptions) {
	return new LernaDriver(options);
}
