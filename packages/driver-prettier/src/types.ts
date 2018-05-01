/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable import/prefer-default-export */

import { RequiredOptions } from 'prettier';

export interface PrettierConfig extends Partial<RequiredOptions> {
  ignore?: string[];
}
