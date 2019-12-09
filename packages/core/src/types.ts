import { Task, ToolConfig, ToolPluginRegistry, PluginSetting } from '@boost/core';
import { ExecaReturnValue, ExecaError } from 'execa';
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

export interface UnknownSettings {
  [key: string]: unknown;
}

export interface BeemoConfig<T = UnknownSettings> extends Omit<ToolConfig, 'settings'> {
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
  settings: T;
  // Driver overrides
  [key: string]: unknown;
}

export interface BeemoProcess<C extends Context = Context, T = UnknownSettings> {
  context: C;
  tool: Beemo<T>;
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

export type ExecutionError = ExecaError;

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
      beemo: BeemoProcess;
    }
  }
}
