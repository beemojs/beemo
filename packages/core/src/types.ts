/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

import { Task, ToolConfig, ToolPluginRegistry, PluginSetting } from '@boost/core';
import { ExecaReturnValue } from 'execa';
import { Arguments, Options } from 'yargs';
import Beemo from './Beemo';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';

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
    graph: boolean;
  };
  module: string;
  scripts: PluginSetting<Script>;
  // Driver overrides
  [key: string]: unknown;
}

export interface DriverCommandOptions {
  [name: string]: Options;
}

export interface DriverOptions {
  args?: string[];
  dependencies?: string[];
  env?: { [key: string]: string };
  strategy?: 'native' | 'create' | 'reference' | 'copy' | 'none';
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
  versionOption: string;
  watchOptions: string[];
  workspaceStrategy: 'reference' | 'copy';
}

export type Execution = ExecaReturnValue;

export type ExecuteType = 'parallel' | 'pool' | 'serial' | 'sync';

export interface ExecuteQueue<T extends Context> {
  tasks: Task<T>[];
  type: ExecuteType;
}

export type StdioType = 'buffer' | 'stream' | 'inherit';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      beemo: {
        context: Context;
        tool: Beemo;
      };
    }
  }
}
