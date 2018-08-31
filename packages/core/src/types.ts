/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Tool, ToolConfig } from '@boost/core';
import { ExecaReturns } from 'execa'; // eslint-disable-line import/no-extraneous-dependencies
import { Arguments, Options } from 'yargs';

export { Arguments };

declare global {
  namespace NodeJS {
    interface Process {
      beemo: {
        context: any;
        tool: Tool;
      };
    }
  }
}

export type Argv = string[];

export interface BeemoConfig extends ToolConfig {
  config: {
    cleanup: boolean;
    parallel: boolean;
  };
}

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
  workspaceStrategy: 'reference' | 'copy';
}

export type Execution = ExecaReturns;
