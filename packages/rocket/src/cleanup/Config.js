/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import Options, { bool } from 'optimal';

import type { CleanupConfig } from '../types';

export default function Config(config: Object): CleanupConfig {
  return new Options(config, {
    persist: bool(),
  }, {
    name: 'CleanupConfig',
  });
}
