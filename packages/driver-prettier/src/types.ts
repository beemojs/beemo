import { RequiredOptions } from 'prettier';

export type CommonConfig = Partial<RequiredOptions>;

export interface OverrideConfig {
  files: string[] | string;
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
  config?: boolean | string;
  configPrecedence?: 'cli-override' | 'file-override' | 'prefer-file';
  cursorOffset?: number;
  editorconfig?: boolean;
  embeddedLanguageFormatting?: PrettierConfig['embeddedLanguageFormatting'];
  endOfLine?: PrettierConfig['endOfLine'];
  fileInfo?: string;
  findConfigPath?: string;
  h?: boolean | string;
  help?: boolean | string;
  htmlWhitespaceSensitivity?: PrettierConfig['htmlWhitespaceSensitivity'];
  ignorePath?: string;
  ignoreUnknown?: boolean;
  insertPragma?: boolean;
  jsxBracketSameLine?: boolean;
  jsxSingleQuote?: boolean;
  l?: boolean;
  listDifferent?: boolean;
  loglevel?: 'debug' | 'error' | 'log' | 'silent' | 'warn';
  parser?: PrettierConfig['parser'];
  plugin?: string[] | string;
  pluginSearchDir?: string[] | string;
  printWidth?: number;
  proseWrap?: PrettierConfig['proseWrap'];
  quoteProps?: PrettierConfig['quoteProps'];
  rangeEnd?: number;
  rangeStart?: number;
  requirePragma?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  stdinFilepath?: string;
  supportInfo?: boolean;
  tabWidth?: number;
  trailingComma?: PrettierConfig['trailingComma'];
  u?: boolean;
  useTabs?: boolean;
  v?: boolean;
  version?: boolean;
  vueIndentScriptAndStyle?: boolean;
  w?: boolean;
  withNodeModules?: boolean;
  write?: boolean;
}
