/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import type { Tool, ToolConfig, Reporter } from 'boost';
import type { Options } from 'yargs';
import type Driver from './Driver';
import type Script from './Script';

export type BeemoConfig = {
  ...ToolConfig,
  config: {
    cleanup: boolean,
    parallel: boolean,
  },
};

export type BeemoTool = Tool<Driver, Reporter<Object>>;

export type DriverCommandOptions = { [name: string]: Options };

export type DriverOptions = {
  args: string[],
  dependencies: string[],
  env: { [key: string]: string },
};

export type DriverMetadata = {
  bin: string,
  configName: string,
  configOption: string,
  dependencies: string[],
  description: string,
  helpOption: string,
  title: string,
  useConfigOption: boolean,
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
  driverName: string,
  drivers: Driver[],
  primaryDriver: Driver,
|};

export type ScriptContext = {|
  ...Context,
  script: ?Script,
  scriptName: string,
  scriptPath: string,
|};
