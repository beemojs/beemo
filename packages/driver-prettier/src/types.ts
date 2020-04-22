import { RequiredOptions } from 'prettier';

export type CommonConfig = Partial<RequiredOptions>;

export interface OverrideConfig {
  files: string | string[];
  options: CommonConfig;
}

export interface PrettierConfig extends CommonConfig {
  ignore?: string[];
  overrides?: OverrideConfig[];
}

export interface PrettierArgs {
  arrowParens?: PrettierConfig['arrowParens'];
  bracketSpacing?: boolean;
  c?: boolean;
  check?: boolean;
  color?: boolean;
  config?: string | boolean;
  configPrecedence?: 'cli-override' | 'file-override' | 'prefer-file';
  cursorOffset?: number;
  editorconfig?: boolean;
  endOfLine?: PrettierConfig['endOfLine'];
  fileInfo?: string;
  findConfigPath?: string;
  h?: string | boolean;
  help?: string | boolean;
  htmlWhitespaceSensitivity?: PrettierConfig['htmlWhitespaceSensitivity'];
  ignorePath?: string;
  insertPragma?: boolean;
  jsxBracketSameLine?: boolean;
  jsxSingleQuote?: boolean;
  l?: boolean;
  listDifferent?: boolean;
  loglevel?: 'silent' | 'error' | 'warn' | 'log' | 'debug';
  parser?: PrettierConfig['parser'];
  plugin?: string;
  pluginSearchDir?: string;
  printWidth?: number;
  proseWrap?: PrettierConfig['proseWrap'];
  quoteProps?: PrettierConfig['quoteProps'];
  rangeEnd?: number;
  rangeStart?: number;
  requirePragma?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  stdin?: boolean;
  stdinFilepath?: string;
  supportInfo?: boolean;
  tabWidth?: number;
  trailingComma?: PrettierConfig['trailingComma'];
  useTabs?: boolean;
  v?: boolean;
  version?: boolean;
  vueIndentScriptAndStyle?: boolean;
  withNodeModules?: boolean;
  write?: boolean;
}

export type PrettierDriverArgs = PrettierArgs;
