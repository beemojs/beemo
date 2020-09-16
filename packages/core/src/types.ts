import { Argv, Arguments, ParserOptions, OptionConfigMap } from '@boost/args';
import { PluginsSetting } from '@boost/config';
import { Pluggable } from '@boost/plugin';
import { ExecaReturnValue, ExecaError } from 'execa';
import Context from './contexts/Context';
import ScriptContext from './contexts/ScriptContext';
import Tool from './Tool';

export { Argv, Arguments, ParserOptions };

export type BeemoTool = Tool;

export interface BeemoProcess<C extends Context = Context> {
  context: C;
  tool: BeemoTool;
}

export interface UnknownSettings {
  [key: string]: unknown;
}

export interface ConfigFile<T extends object = UnknownSettings> {
  configure: {
    cleanup: boolean;
    parallel: boolean;
  };
  debug: boolean;
  drivers: PluginsSetting;
  execute: {
    concurrency: number;
    graph: boolean;
  };
  module: string;
  scripts: PluginsSetting;
  settings: T;
}

export type Execution = ExecaReturnValue;

export type ExecutionError = ExecaError;

export type StdioType = 'buffer' | 'stream' | 'inherit';

// DRIVERS

export type DriverCommandOptions = OptionConfigMap;

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

export interface DriverOutput {
  stderr: string;
  stdout: string;
}

export interface Driverable extends Pluggable<BeemoTool> {
  metadata: DriverMetadata;
}

// SCRIPTS

export interface Scriptable<O extends object> extends Pluggable<BeemoTool> {
  parse: () => ParserOptions<O>;
  execute: (context: ScriptContext, args: Arguments<O>) => Promise<unknown>;
}

// ROUTINES

export interface RoutineOptions {
  tool: BeemoTool;
}

// OTHER

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      beemo: BeemoProcess;
    }
  }
}
