import { Task, ToolConfig, ToolPluginRegistry } from '@boost/core';
import { PluginsSetting } from '@boost/config';
import { Pluggable } from '@boost/plugin';
import { ExecaReturnValue, ExecaError } from 'execa';
import { Arguments, Options } from 'yargs';
import Beemo from './Beemo';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';

export { Arguments };

// TODO
export type Argv = string[];

// TODO
export type BeemoTool = any;

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
  drivers: $FixMe;
  execute: {
    concurrency: number;
    graph: boolean;
  };
  module: string;
  scripts: $FixMe;
  settings: T;
}

export interface ConfigFile<T extends object = UnknownSettings> {
  configure: {
    cleanup: boolean;
    parallel: boolean;
  };
  drivers: PluginsSetting;
  execute: {
    concurrency: number;
    graph: boolean;
  };
  module: string;
  scripts: PluginsSetting;
  settings: T;
}

export interface BeemoProcess<C extends Context = Context, T = UnknownSettings> {
  context: C;
  tool: Beemo<T>;
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

// DRIVERS

export interface DriverCommandOptions {
  [name: string]: Options;
}

export type DriverStrategy = 'native' | 'create' | 'reference' | 'copy' | 'none';

export interface DriverOptions {
  args?: string[];
  dependencies?: string[];
  env?: { [key: string]: string };
  strategy?: DriverStrategy;
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

export interface Driverable extends Pluggable<BeemoTool> {
  metadata: DriverMetadata;
}

// SCRIPTS

export interface Scriptable extends Pluggable<BeemoTool> {
  args: () => object;
  execute: (context: $FixMe, args: $FixMe) => Promise<unknown>;
}
