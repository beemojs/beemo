/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import type Engine from './Engine';

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

export type RocketContext = {
  args: string[],
  configPaths: string[],
  configRoot: string,
  engines: Engine[],
  primaryEngine: Engine,
  root: string,
};
