import typescript from 'typescript';

export type TargetSetting = 'ES5' | 'ES2015' | 'ES2016' | 'ES2017' | 'ES2018' | 'ESNEXT';

export type ModuleSetting = 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es2015' | 'ESNext';

export type LibSetting =
  | 'es5'
  | 'es6'
  | 'es2015'
  | 'es7'
  | 'es2016'
  | 'es2017'
  | 'es2018'
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

export type JSXSetting = 'preserve' | 'react-native' | 'react';

export interface TypeScriptConfig {
  compileOnSave?: boolean;
  compilerOptions?: typescript.CompilerOptions;
  exclude?: string[];
  extends?: string;
  files?: string[];
  include?: string[];
  typeAcquisition?: typescript.TypeAcquisition;
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
