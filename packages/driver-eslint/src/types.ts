/* eslint-disable no-magic-numbers */

export type EnvType =
  | 'browser'
  | 'node'
  | 'commonjs'
  | 'shared-node-browser'
  | 'es6'
  | 'es2017'
  | 'es2020'
  | 'worker'
  | 'amd'
  | 'mocha'
  | 'jasmine'
  | 'jest'
  | 'phantomjs'
  | 'protractor'
  | 'qunit'
  | 'jquery'
  | 'prototypejs'
  | 'shelljs'
  | 'meteor'
  | 'mongo'
  | 'applescript'
  | 'nashorn'
  | 'serviceworker'
  | 'atomtest'
  | 'embertest'
  | 'webextensions'
  | 'greasemonkey';

export type GlobalSetting = 'readonly' | 'readable' | 'writable' | 'writeable' | 'off' | boolean;

export type EcmaVersion = 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020;

export type RuleSetting = 0 | 1 | 2 | '0' | '1' | '2' | 'off' | 'warn' | 'error';

export type RuleOptions = string | number | boolean | { [option: string]: unknown };

export interface Rules {
  [rule: string]:
    | RuleSetting
    | [RuleSetting, RuleOptions]
    | [RuleSetting, RuleOptions, RuleOptions];
}

export interface ParserOptions {
  ecmaVersion?: EcmaVersion;
  sourceType?: 'script' | 'module';
  ecmaFeatures?: {
    globalReturn?: boolean;
    impliedStrict?: boolean;
    jsx?: boolean;
  };
  [option: string]: unknown;
}

export interface CommonConfig {
  env?: { [K in EnvType]?: boolean } & { [env: string]: boolean };
  extends?: string | string[];
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
  extends?: string | string[];
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
