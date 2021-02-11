/* eslint-disable no-magic-numbers */

export type EnvType =
  'amd' | 'applescript' | 'atomtest' | 'browser' | 'commonjs' | 'embertest' | 'es6' | 'es2017' | 'es2020' | 'greasemonkey' | 'jasmine' | 'jest' | 'jquery' | 'meteor' | 'mocha' | 'mongo' | 'nashorn' | 'node' | 'phantomjs' | 'prototypejs' | 'protractor' | 'qunit' | 'serviceworker' | 'shared-node-browser' | 'shelljs' | 'webextensions' | 'worker';

export type GlobalSetting = boolean | 'off' | 'readable' | 'readonly' | 'writable' | 'writeable';

export type EcmaVersion =
  | 3
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 2015
  | 2016
  | 2017
  | 2018
  | 2019
  | 2020
  | 2021;

export type RuleSetting = '0' | '1' | '2' | 'error' | 'off' | 'warn' | 0 | 1 | 2;

export type RuleOptions = boolean | number | string | { [option: string]: unknown };

export interface Rules {
  [rule: string]: RuleSetting | [RuleSetting, ...RuleOptions[]];
}

export interface ParserOptions {
  [option: string]: unknown;
  ecmaVersion?: EcmaVersion;
  sourceType?: 'module' | 'script';
  ecmaFeatures?: {
    globalReturn?: boolean;
    impliedStrict?: boolean;
    jsx?: boolean;
  };
}

export interface CommonConfig {
  env?: { [env: string]: boolean } & { [K in EnvType]?: boolean };
  extends?: string[] | string;
  globals?: { [global: string]: GlobalSetting };
  ignore?: string[];
  parser?: string;
  parserOptions?: ParserOptions;
  plugins?: string[];
  processor?: string;
  rules?: Rules;
  root?: boolean;
  settings?: { [setting: string]: unknown };
}

export interface OverrideConfig extends CommonConfig {
  files: string[];
  excludedFiles?: string;
}

export interface ESLintConfig extends CommonConfig {
  extends?: string[] | string;
  noInlineConfig?: boolean;
  overrides?: OverrideConfig[];
  reportUnusedDisableDirectives?: boolean;
  root?: boolean;
}

export interface ESLintArgs {
  c?: string;
  cache?: boolean;
  cacheFile?: string;
  cacheLocation?: string;
  color?: boolean;
  config?: string;
  debug?: boolean;
  env?: string;
  envInfo?: boolean;
  eslintrc?: boolean;
  ext?: string;
  f?: string;
  fix?: boolean;
  fixDryRun?: boolean;
  fixType?: boolean;
  format?: string;
  global?: string;
  h?: boolean;
  help?: boolean;
  ignore?: boolean;
  ignorePath?: string;
  ignorePattern?: string;
  init?: boolean;
  inlineConfig?: boolean;
  maxWarnings?: number;
  o?: string;
  outputFile?: string;
  parser?: string;
  parserOptions?: object;
  plugin?: string;
  printConfig?: string;
  quiet?: boolean;
  reportUnusedDisableDirectives?: boolean;
  resolvePluginsRelativeTo?: string;
  rule?: object;
  rulesdir?: string;
  stdin?: boolean;
  stdinFilename?: string;
  v?: boolean;
  version?: boolean;
}
