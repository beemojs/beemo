/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

export type CleanupConfig = {
  persist: boolean,
};

export type ConfigureConfig = {
  parallel: boolean,
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
