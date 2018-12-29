/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

export type MatchPattern =
  | string
  | RegExp
  | ((fileName: string, context: any, envName: string) => boolean);

export type SourceMapsOption = boolean | 'inline' | 'both';

export type PluginEntry = [string, { [option: string]: any }, string?];

export type PresetEntry = [string, { [option: string]: any }, string?];

export interface BabelConfig {
  ast?: boolean;
  auxiliaryCommentAfter?: string;
  auxiliaryCommentBefore?: string;
  babelrc?: boolean;
  babelrcRoots?: boolean | MatchPattern | MatchPattern[];
  caller?: { name: string; [key: string]: any };
  code?: boolean;
  comments?: boolean;
  compact?: boolean | 'auto';
  configFile?: string | boolean;
  cwd?: string;
  env?: { [env: string]: BabelConfig };
  envName?: string;
  exclude?: MatchPattern | MatchPattern[];
  extends?: string;
  filename?: string;
  filenameRelative?: string;
  generatorOpts?: { [option: string]: any };
  getModuleId?: (name: string) => string;
  highlightCode?: boolean;
  ignore?: MatchPattern[];
  include?: MatchPattern | MatchPattern[];
  inputSourceMap?: boolean | object;
  minified?: boolean;
  moduleId?: string;
  moduleIds?: boolean;
  moduleRoot?: string;
  only?: MatchPattern[];
  overrides?: BabelConfig[];
  parserOpts?: { [option: string]: any };
  passPerPreset?: boolean;
  plugins?: (string | PluginEntry)[];
  presets?: (string | PresetEntry)[];
  retainLines?: boolean;
  root?: string;
  shouldPrintComment?: (value: string) => boolean;
  sourceFileName?: string;
  sourceMaps?: SourceMapsOption;
  sourceRoot?: string;
  sourceType?: 'module' | 'script' | 'unambiguous';
  test?: MatchPattern | MatchPattern[];
  wrapPluginVisitorMethod?: (key: string, nodeType: string, fn: Function) => Function;
}

export interface BabelArgs {
  auxiliaryCommentAfter?: string;
  auxiliaryCommentBefore?: string;
  babelrc?: boolean;
  comments?: boolean;
  compact?: boolean | 'auto';
  configFile?: string;
  copyFiles?: boolean;
  D?: boolean;
  d?: string;
  deleteDirOnStart?: boolean;
  envName?: string;
  extensions?: string;
  f?: string;
  filename?: string;
  h?: boolean;
  help?: boolean;
  highlightCode?: boolean;
  ignore?: string | string[];
  includeDotfiles?: boolean;
  keepFileExtension?: boolean;
  M?: boolean;
  minified?: string;
  moduleId?: string;
  moduleIds?: boolean;
  moduleRoot?: string;
  o?: string;
  only?: string | string[];
  outDir?: string;
  outFile?: string;
  plugins?: string | string[];
  presets?: string | string[];
  relative?: boolean;
  retainLines?: boolean;
  rootMode?: string;
  s?: boolean | string;
  skipInitialBuild?: boolean;
  sourceFileName?: string;
  sourceMaps?: SourceMapsOption;
  sourceMapTarget?: string;
  sourceRoot?: string;
  sourceType?: 'script' | 'module';
  V?: boolean;
  verbose?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
  x?: string;
}
