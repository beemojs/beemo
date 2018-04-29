/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { RequiredOptions } from 'prettier';

export interface PrettierConfig extends Partial<RequiredOptions> {
  ignore?: string[];
}
