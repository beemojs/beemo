/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable import/prefer-default-export */

import typescript from 'typescript';

export interface TypeScriptConfig {
  compileOnSave?: boolean;
  compilerOptions?: typescript.CompilerOptions;
  exclude?: string[];
  extends?: string;
  files?: string[];
  include?: string[];
  typeAcquisition?: typescript.TypeAcquisition;
}
