import { ExecaError, ExecaReturnValue } from 'execa';
import {
  Arguments,
  Argv,
  Command,
  MapOptionConfig,
  MapParamConfig,
  OptionConfigMap,
  ParserOptions,
  PrimitiveType,
} from '@boost/args';
import { Path, PortablePath } from '@boost/common';
import { PluginsSetting } from '@boost/config';
import { Pluggable } from '@boost/plugin';
import type Context from './contexts/Context';
import type ScriptContext from './contexts/ScriptContext';
import type Tool from './Tool';

export { Arguments, Argv, ParserOptions };

export type BeemoTool = Tool;

export interface BeemoProcess<C extends Context = Context> {
  context: C;
  tool: BeemoTool;
}

export type UnknownSettings = Record<string, unknown>;

export interface BootstrapFile {
  bootstrap?: (tool: BeemoTool) => Promise<void> | void;
  default?: (tool: BeemoTool) => Promise<void> | void;
  (tool: BeemoTool): Promise<void> | void;
}

export type Execution = ExecaReturnValue;

export type ExecutionError = ExecaError;

export type StdioType = 'buffer' | 'inherit' | 'stream';

// DRIVERS

export type DriverStrategy = 'copy' | 'create' | 'native' | 'none' | 'reference' | 'template';

export interface DriverOptions {
  args?: string[];
  dependencies?: string[];
  env?: Record<string, string>;
  expandGlobs?: boolean;
  strategy?: DriverStrategy;
  template?: string;
}

export interface DriverMetadata {
  bin: string;
  commandOptions: OptionConfigMap;
  configName: string;
  configOption: string;
  configStrategy: 'copy' | 'create' | 'reference' | 'template';
  dependencies: string[];
  description: string;
  filterOptions: boolean;
  helpOption: string;
  title: string;
  useConfigOption: boolean;
  versionOption: string;
  watchOptions: string[];
  workspaceStrategy: 'copy' | 'reference';
}

export interface DriverOutput {
  stderr: string;
  stdout: string;
}

export interface Driverable extends Pluggable<BeemoTool> {
  metadata: DriverMetadata;
}

// DRIVER COMMANDS

export interface DriverCommandConfig<O extends object, P extends PrimitiveType[]>
  extends Omit<Command, 'category'> {
  allowUnknownOptions?: boolean;
  allowVariadicParams?: boolean | string;
  options?: MapOptionConfig<O>;
  params?: MapParamConfig<P>;
}

export type DriverCommandRunner<O extends object, P extends PrimitiveType[]> = (
  tool: Tool,
  options: O,
  params: P,
  rest: string[],
) => Promise<string | undefined | void> | string | undefined | void;

export interface DriverCommandRegistration<O extends object, P extends PrimitiveType[]> {
  path: string;
  config: DriverCommandConfig<O, P>;
  runner: DriverCommandRunner<O, P>;
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

// CONFIG

export interface BeemoConfig<T extends object = UnknownSettings> {
  configure?: {
    cleanup?: boolean;
    parallel?: boolean;
  };
  debug?: boolean;
  drivers?: PluginsSetting;
  execute?: {
    concurrency?: number;
    graph?: boolean;
  };
  module?: string;
  scripts?: PluginsSetting;
  settings?: T;
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

export type ConfigObject = Record<string, unknown>;

export interface ConfigTemplateOptions {
  configModule: string;
  consumerConfigPath: Path | null;
  context: Context;
  driver: Driverable;
  driverConfigPath: Path;
  driverName: string;
  providerConfigPath: Path | null;
  templatePath: Path;
  tool: BeemoTool;
}

export interface ConfigTemplateResult {
  config: ConfigObject | string;
  path?: PortablePath;
}

export type ConfigTemplate = (
  configs: ConfigObject[],
  options: ConfigTemplateOptions,
) => ConfigTemplateResult;

// OTHER

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      beemo: BeemoProcess;
    }
  }
}
