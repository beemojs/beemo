/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import Options, { bool } from 'optimal';

import type { ConfigureConfig } from '../types';

export default function Config(config: Object): ConfigureConfig {
  return new Options(
    config,
    {
      cleanup: bool(false),
      parallel: bool(true),
    },
    {
      name: 'ConfigureConfig',
    },
  );
}
