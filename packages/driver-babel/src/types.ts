export interface MatchContext {
  callee?: { name: string };
  envName: string;
}

export type MatchPattern = string | RegExp | ((fileName: string, context: MatchContext) => boolean);

export type SourceMaps = boolean | 'inline' | 'both';

export type SourceType = 'module' | 'script' | 'unambiguous';

export type PluginEntry = [string, { [option: string]: unknown }, string?];

export type PresetEntry = [string, { [option: string]: unknown }, string?];

export type RootMode = 'root' | 'upward' | 'upward-optional';

export interface BabelConfig {
  ast?: boolean;
  auxiliaryCommentAfter?: string;
  auxiliaryCommentBefore?: string;
  babelrc?: boolean;
  babelrcRoots?: boolean | MatchPattern | MatchPattern[];
  caller?: { [key: string]: unknown; name: string };
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
  generatorOpts?: { [option: string]: unknown };
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
  parserOpts?: { [option: string]: unknown };
  passPerPreset?: boolean;
  plugins?: (string | PluginEntry)[];
  presets?: (string | PresetEntry)[];
  retainLines?: boolean;
  root?: string;
  rootMode?: RootMode;
  shouldPrintComment?: (value: string) => boolean;
  sourceFileName?: string;
  sourceMaps?: SourceMaps;
  sourceRoot?: string;
  sourceType?: SourceType;
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
  d?: string;
  D?: boolean;
  deleteDirOnStart?: boolean;
  envName?: string;
  extensions?: string;
  f?: string;
  filename?: string;
  h?: boolean;
  help?: boolean;
  highlightCode?: boolean;
  ignore?: string[];
  includeDotfiles?: boolean;
  keepFileExtension?: boolean;
  M?: boolean;
  minified?: boolean;
  moduleId?: string;
  moduleIds?: boolean;
  moduleRoot?: string;
  o?: string;
  only?: string[];
  outDir?: string;
  outFile?: string;
  plugins?: string[];
  presets?: string[];
  quiet?: boolean;
  relative?: boolean;
  retainLines?: boolean;
  rootMode?: RootMode;
  s?: SourceMaps;
  skipInitialBuild?: boolean;
  sourceFileName?: string;
  sourceMaps?: SourceMaps;
  sourceMapTarget?: string;
  sourceRoot?: string;
  sourceType?: SourceType;
  V?: boolean;
  verbose?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
  x?: string;
}
