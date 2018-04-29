/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

export type PathLookup = string | Function | RegExp;

export type SourceMapsOption = boolean | 'inline' | 'both';

export type PluginConfig = [string, { [option: string]: any }];

export type PresetConfig = [string, { [option: string]: any }];

export interface BabelConfig {
  ast?: boolean;
  auxiliaryCommentAfter?: string;
  auxiliaryCommentBefore?: string;
  babelrc?: boolean;
  code?: boolean;
  comments?: boolean;
  compact?: boolean | 'auto';
  cwd?: string;
  extends?: string;
  filename?: string;
  filenameRelative?: string;
  generatorOpts?: { [option: string]: any };
  highlightCode?: boolean;
  ignore?: PathLookup | PathLookup[];
  inputSourceMap?: object;
  minified?: boolean;
  moduleId?: string;
  moduleIds?: boolean;
  moduleRoot?: string;
  only?: PathLookup | PathLookup[];
  parserOpts?: { [option: string]: any };
  plugins?: (string | PluginConfig)[];
  presets?: (string | PresetConfig)[];
  retainLines?: boolean;
  sourceFileName?: string;
  sourceMap?: SourceMapsOption;
  sourceMaps?: SourceMapsOption;
  sourceMapTarget?: string;
  sourceRoot?: string;
  sourceType?: 'module' | 'script' | 'unambiguous';
}
