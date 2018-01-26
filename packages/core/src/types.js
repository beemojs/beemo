/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import type Driver from './Driver';

export type ConfigureConfig = {
  parallel: boolean,
};

export type ExecuteConfig = {
  cleanup: boolean,
};

export type Execution = {
  cmd: string,
  code: string | number,
  failed: boolean,
  killed?: boolean,
  signal: ?number,
  stderr: string,
  stdout: string,
  timedOut: boolean,
};

export type BeemoContext = {
  args: string[],
  argsObject: Object,
  configPaths: string[],
  configRoot: string,
  drivers: Driver[],
  primaryDriver: Driver,
  root: string,
};
