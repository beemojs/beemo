import eslint from 'eslint';

export type FixType = 'layout' | 'problem' | 'suggestion';

export type FormatType =
  | 'checkstyle'
  | 'codeframe'
  | 'compact'
  | 'html'
  | 'jslint-xml'
  | 'json'
  | 'junit'
  | 'stylish'
  | 'table'
  | 'tap'
  | 'unix'
  | 'visualstudio';

export type GlobalSetting = boolean | 'readable' | 'readonly' | 'writable' | 'writeable';

export type ECMAVersion = NonNullable<eslint.Linter.ParserOptions['ecmaVersion']>;

export type Rules = eslint.Linter.RulesRecord;

export type ParserOptions = eslint.Linter.ParserOptions;

export interface ESLintConfig extends eslint.Linter.Config {
  ignore?: string[];
}

export interface ESLintArgs {
  c?: string;
  cache?: boolean;
  cacheFile?: string;
  cacheLocation?: string;
  color?: boolean;
  config?: string;
  debug?: boolean;
  env?: string[];
  envInfo?: boolean;
  errorOnUnmatchedPattern?: boolean;
  eslintrc?: boolean;
  ext?: string[];
  f?: string;
  fix?: boolean;
  fixDryRun?: boolean;
  fixType?: FixType[];
  format?: FormatType;
  global?: string[];
  h?: boolean;
  help?: boolean;
  ignore?: boolean;
  ignorePath?: string;
  ignorePattern?: string[];
  init?: boolean;
  inlineConfig?: boolean;
  maxWarnings?: number;
  o?: string;
  outputFile?: string;
  parser?: string;
  parserOptions?: object;
  plugin?: string[];
  printConfig?: string;
  quiet?: boolean;
  reportUnusedDisableDirectives?: boolean;
  resolvePluginsRelativeTo?: string;
  rule?: object[];
  rulesdir?: string[];
  stdin?: boolean;
  stdinFilename?: string;
  v?: boolean;
  version?: boolean;
}
