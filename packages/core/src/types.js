/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import type Driver from './Driver';
import type Script from './Script';

export type ConfigureConfig = {
  parallel: boolean,
};

export type ExecuteConfig = {
  cleanup: boolean,
  parallelArgs: string[],
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

export type Context = {|
  args: string[],
  moduleRoot: string,
  root: string,
  yargs: Object,
|};

export type DriverContext = {|
  ...Context,
  configPaths: string[],
  drivers: Driver[],
  primaryDriver: Driver,
|};

export type ScriptContext = {|
  ...Context,
  script: ?Script,
  scriptName: string,
  scriptPath: string,
|};
