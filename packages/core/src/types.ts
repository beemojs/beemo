/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { ToolConfig } from 'boost';
import { ExecaReturns } from 'execa';
import { Struct } from 'optimal';
import { Arguments, Options } from 'yargs';
import Driver from './Driver';
import Script from './Script';

export interface BeemoConfig extends ToolConfig {
  config: {
    cleanup: boolean;
    parallel: boolean;
  };
}

export interface DriverCommandOptions extends Struct {
  [name: string]: Options;
}

export interface DriverOptions extends Struct {
  args: string[];
  dependencies: string[];
  env: { [key: string]: string };
}

export interface DriverMetadata extends Struct {
  bin: string;
  configName: string;
  configOption: string;
  dependencies: string[];
  description: string;
  filterOptions: boolean;
  helpOption: string;
  title: string;
  useConfigOption: boolean;
}

export type Execution = ExecaReturns;

export interface Context extends Struct {
  args: Arguments;
  argsList: string[];
  moduleRoot: string;
  root: string;
  workspaceRoot: string;
}

export interface DriverContext extends Context {
  configPaths: string[];
  driverName: string;
  drivers: Driver[];
  primaryDriver: Driver;
}

export interface ScriptContext extends Context {
  script: Script | null;
  scriptName: string;
  scriptPath: string;
}
