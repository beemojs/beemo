/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-magic-numbers */

export type RuleSetting = 0 | 1 | 2 | '0' | '1' | '2' | 'off' | 'warn' | 'error';

export type RuleOptions = string | number | boolean | { [option: string]: any };

export interface Rules {
  [rule: string]:
    | RuleSetting
    | [RuleSetting, RuleOptions]
    | [RuleSetting, RuleOptions, RuleOptions];
}

export interface CommonConfig {
  env?: { [env: string]: boolean };
  extends?: string | string[];
  globals?: { [global: string]: boolean };
  ignore?: string[];
  parser?: string;
  parserOptions?: {
    ecmaVersion?: 3 | 5 | 6 | 7 | 8 | 9 | 2015 | 2016 | 2017 | 2018;
    sourceType?: 'script' | 'module';
    ecmaFeatures?: {
      experimentalObjectRestSpread?: boolean;
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
