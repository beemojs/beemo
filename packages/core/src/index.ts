/**
 * @copyright   2021, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Blueprint, PackageStructure, Path, PortablePath, Predicates } from '@boost/common';
import ConfigContext from './contexts/ConfigContext';
import Context from './contexts/Context';
import DriverContext, { DriverContextOptions, DriverContextParams } from './contexts/DriverContext';
import ScaffoldContext, {
  ScaffoldContextOptions,
  ScaffoldContextParams,
} from './contexts/ScaffoldContext';
import ScriptContext, { ScriptContextOptions, ScriptContextParams } from './contexts/ScriptContext';
import Driver from './Driver';
import Script from './Script';
import Tool from './Tool';

export {
  ConfigContext,
  Context,
  Driver,
  DriverContext,
  Path,
  ScaffoldContext,
  Script,
  ScriptContext,
  Tool,
};

export type {
  Blueprint,
  DriverContextOptions,
  DriverContextParams,
  PackageStructure,
  PortablePath,
  Predicates,
  ScaffoldContextOptions,
  ScaffoldContextParams,
  ScriptContextOptions,
  ScriptContextParams,
};

export * from './constants';
export * from './types';
