/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-magic-numbers */

export type EnvType =
  | 'browser'
  | 'node'
  | 'commonjs'
  | 'shared-node-browser'
  | 'es6'
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

export type RuleSetting = 0 | 1 | 2 | '0' | '1' | '2' | 'off' | 'warn' | 'error';

export type RuleOptions = string | number | boolean | { [option: string]: any };

export interface Rules {
  [rule: string]:
    | RuleSetting
    | [RuleSetting, RuleOptions]
    | [RuleSetting, RuleOptions, RuleOptions];
}

export interface CommonConfig {
  env?: { [K in EnvType]?: boolean } & { [other: string]: boolean };
  extends?: string | string[];
  globals?: { [global: string]: boolean };
  ignore?: string[];
  parser?: string;
  parserOptions?: {
    ecmaVersion?: 3 | 5 | 6 | 7 | 8 | 9 | 2015 | 2016 | 2017 | 2018;
    sourceType?: 'script' | 'module';
    ecmaFeatures?: {
      globalReturn?: boolean;
      impliedStrict?: boolean;
      jsx?: boolean;
    };
  };
  plugins?: string[];
  rules?: Rules;
  root?: boolean;
  settings?: { [setting: string]: any };
}

export interface OverrideConfig extends CommonConfig {
  files: string[];
  excludedFiles?: string;
}

export interface ESLintConfig extends CommonConfig {
  extends?: string | string[];
  overrides?: OverrideConfig[];
  root?: boolean;
}
