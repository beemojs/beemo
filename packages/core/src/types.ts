/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Tool, ToolConfig, ToolPluginRegistry, PluginSetting } from '@boost/core';
import { ExecaReturns } from 'execa';
import { Arguments, Options } from 'yargs';
import Driver from './Driver';
import Script from './Script';

export { Arguments };

export type Argv = string[];

export interface BeemoPluginRegistry extends ToolPluginRegistry {
  driver: Driver;
  script: Script;
}

export interface BeemoConfig extends ToolConfig {
  configure: {
    cleanup: boolean;
    parallel: boolean;
  };
  drivers: PluginSetting<Driver>;
  execute: {
    concurrency: number;
    priority: boolean;
  };
  module: string;
  scripts: PluginSetting<Script>;
  // Driver overrides
  [key: string]: any;
}

export type BeemoTool = Tool<BeemoPluginRegistry, BeemoConfig>;

export interface DriverCommandOptions {
  [name: string]: Options;
}

export interface DriverOptions {
  args: string[];
  dependencies: string[];
  env: { [key: string]: string };
  strategy: 'native' | 'create' | 'reference' | 'copy';
}

export interface DriverMetadata {
  bin: string;
  configName: string;
  configOption: string;
  configStrategy: 'create' | 'reference' | 'copy';
  dependencies: string[];
  description: string;
  filterOptions: boolean;
  helpOption: string;
  title: string;
  useConfigOption: boolean;
  watchOptions: string[];
  workspaceStrategy: 'reference' | 'copy';
}

export type Execution = ExecaReturns;

export type ExecuteType = 'parallel' | 'pool' | 'serial' | 'sync';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      beemo: {
        context: any;
        tool: BeemoTool;
      };
    }
  }
}
