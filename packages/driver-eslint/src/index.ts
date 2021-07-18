/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { DriverOptions } from '@beemo/core';
import { ESLintDriver } from './ESLintDriver';

export type { ESLintDriver };
export * from './types';

export default function eslintDriver(options?: DriverOptions) {
	return new ESLintDriver(options);
}
