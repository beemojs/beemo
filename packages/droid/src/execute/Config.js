/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import Options, { bool } from 'optimal';

import type { ExecuteConfig } from '../types';

export default function Config(config: Object): ExecuteConfig {
  return new Options(config, {
    cleanup: bool(true),
  }, {
    name: 'ExecuteConfig',
  });
}
