/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { FlowDriver } from './FlowDriver';

export * from './types';

// eslint-disable-next-line import/no-default-export
export default function flowDriver(options?: DriverOptions) {
	return new FlowDriver(options);
}
