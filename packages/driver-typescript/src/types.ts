import ts from 'typescript';
import { DriverOptions } from '@beemo/core';

export type TargetSetting =
  | 'es3'
  | 'es5'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'esnext';

export type ModuleSetting =
  | 'none'
  | 'commonjs'
  | 'amd'
  | 'system'
  | 'umd'
  | 'es6'
  | 'es2015'
  | 'esnext';

export type ModuleResolutionSetting = 'node' | 'classic';

export type LibSetting =
  | 'es5'
  | 'es6'
  | 'es7'
  | 'es2015'
  | 'es2016'
  | 'es2017'
  | 'es2018'
  | 'es2019'
  | 'esnext'
  | 'dom'
  | 'dom.iterable'
  | 'webworker'
  | 'webworker.importscripts'
  | 'scripthost'
  | 'es2015.core'
  | 'es2015.collection'
  | 'es2015.generator'
  | 'es2015.iterable'
  | 'es2015.promise'
  | 'es2015.proxy'
  | 'es2015.reflect'
  | 'es2015.symbol'
  | 'es2015.symbol.wellknown'
  | 'es2016.array.include'
  | 'es2017.object'
  | 'es2017.sharedmemory'
  | 'es2017.string'
  | 'es2017.intl'
  | 'es2017.typedarrays'
  | 'es2018.intl'
  | 'es2018.promise'
  | 'es2018.regexp'
  | 'esnext.array'
  | 'esnext.symbol'
  | 'esnext.asynciterable'
  | 'esnext.intl'
  | 'esnext.bigint';

export type JSXSetting = 'preserve' | 'react-native' | 'react' | 'none';

export interface CompilerOptions {
  allowJs?: boolean;
  allowSyntheticDefaultImports?: boolean;
  allowUnreachableCode?: boolean;
  allowUnusedLabels?: boolean;
  alwaysStrict?: boolean;
  baseUrl?: string;
  charset?: string;
  checkJs?: boolean;
  composite?: boolean;
  declaration?: boolean;
  declarationDir?: string;
  declarationMap?: boolean;
  disableSizeLimit?: boolean;
  downlevelIteration?: boolean;
  emitBOM?: boolean;
  emitDeclarationOnly?: boolean;
  emitDecoratorMetadata?: boolean;
  esModuleInterop?: boolean;
  experimentalDecorators?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  importHelpers?: boolean;
  incremental?: boolean;
  inlineSourceMap?: boolean;
  inlineSources?: boolean;
  isolatedModules?: boolean;
  jsx?: JSXSetting;
  jsxFactory?: string;
  keyofStringsOnly?: boolean;
  lib?: string[];
  locale?: string;
  mapRoot?: string;
  maxNodeModuleJsDepth?: number;
  module?: ModuleSetting;
  moduleResolution?: ModuleResolutionSetting;
  newLine?: 'lf' | 'crlf';
  noEmit?: boolean;
  noEmitHelpers?: boolean;
  noEmitOnError?: boolean;
  noErrorTruncation?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  noImplicitAny?: boolean;
  noImplicitReturns?: boolean;
  noImplicitThis?: boolean;
  noImplicitUseStrict?: boolean;
  noLib?: boolean;
  noResolve?: boolean;
  noStrictGenericChecks?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  out?: string;
  outDir?: string;
  outFile?: string;
  paths?: { [key: string]: string[] };
  preserveConstEnums?: boolean;
  preserveSymlinks?: boolean;
  project?: string;
  reactNamespace?: string;
  removeComments?: boolean;
  resolveJsonModule?: boolean;
  rootDir?: string;
  rootDirs?: string[];
  skipDefaultLibCheck?: boolean;
  skipLibCheck?: boolean;
  sourceMap?: boolean;
  sourceRoot?: string;
  strict?: boolean;
  strictBindCallApply?: boolean;
  strictFunctionTypes?: boolean;
  strictNullChecks?: boolean;
  strictPropertyInitialization?: boolean;
  stripInternal?: boolean;
  suppressExcessPropertyErrors?: boolean;
  suppressImplicitAnyIndexErrors?: boolean;
  target?: TargetSetting;
  traceResolution?: boolean;
  tsBuildInfoFile?: string;
  typeRoots?: string[];
  types?: string[];
}

export interface TypeScriptConfig {
  compileOnSave?: boolean;
  compilerOptions?: CompilerOptions;
  exclude?: string[];
  extends?: string;
  files?: string[];
  include?: string[];
  references?: ts.ProjectReference[];
  typeAcquisition?: ts.TypeAcquisition;
}

export interface TypeScriptArgs {
  all?: boolean;
  allowJs?: string;
  alwaysStrict?: boolean;
  b?: boolean;
  build?: boolean;
  d?: boolean;
  declaration?: boolean;
  declarationMap?: boolean;
  esModuleInterop?: boolean;
  h?: boolean;
  help?: boolean;
  init?: boolean;
  jsx?: JSXSetting;
  lib?: LibSetting;
  m?: ModuleSetting;
  module?: ModuleSetting;
  noEmit?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  noImplicitAny?: boolean;
  noImplicitReturns?: boolean;
  noImplicitThis?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  outDir?: string;
  outFile?: string;
  p?: string;
  pretty?: boolean;
  project?: string;
  removeComments?: boolean;
  sourceMap?: boolean;
  strict?: boolean;
  strictBindCallApply?: boolean;
  strictFunctionTypes?: boolean;
  strictNullChecks?: boolean;
  strictPropertyInitialization?: boolean;
  t?: TargetSetting;
  target?: TargetSetting;
  types?: boolean;
  v?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
}

export interface TypeScriptOptions extends DriverOptions {
  buildFolder?: string;
  globalTypes?: boolean;
  localTypes?: boolean;
  srcFolder?: string;
  testsFolder?: string;
  typesFolder?: string;
}
