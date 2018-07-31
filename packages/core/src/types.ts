/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { ToolConfig, ToolInterface } from 'boost';
import { ExecaReturns } from 'execa'; // eslint-disable-line import/no-extraneous-dependencies
import { Struct } from 'optimal';
import { Arguments, Options } from 'yargs';

export { Arguments };

declare global {
  namespace NodeJS {
    interface Process {
      beemo: {
        context: any;
        tool: ToolInterface;
      };
    }
  }
}

export type Argv = string[];

export type ConfigStrategy = 'create' | 'reference' | 'copy';

export type WorkspaceStrategy = 'reference' | 'copy';

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
  strategy: '' | ConfigStrategy;
}

export interface DriverMetadata extends Struct {
  bin: string;
  configName: string;
  configOption: string;
  configStrategy: ConfigStrategy;
  dependencies: string[];
  description: string;
  filterOptions: boolean;
  helpOption: string;
  title: string;
  useConfigOption: boolean;
  workspaceStrategy: WorkspaceStrategy;
}

export type Execution = ExecaReturns;
