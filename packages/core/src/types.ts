/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Tool, ToolConfig, ToolPluginRegistry } from '@boost/core';
import { ExecaReturns } from 'execa';
import { Arguments, Options } from 'yargs';
import Driver from './Driver';

export { Arguments };

export type Argv = string[];

export interface BeemoPluginRegistry extends ToolPluginRegistry {
  driver: Driver;
}

export interface BeemoConfig extends ToolConfig {
  configure: {
    cleanup: boolean;
    parallel: boolean;
  };
  execute: {
    concurrency: number;
    priority: boolean;
  };
  module: string;
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

declare global {
  namespace NodeJS {
    interface Process {
      beemo: {
        context: any;
        tool: BeemoTool;
      };
    }
  }
}
