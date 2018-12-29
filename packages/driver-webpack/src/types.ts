/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import webpack from 'webpack';

// eslint-disable-next-line typescript/no-empty-interface
export interface WebpackConfig extends webpack.Configuration {}

export interface WebpackArgs {
  bail?: boolean;
  buildDelimiter?: string;
  cache?: string;
  color?: boolean;
  colors?: boolean;
  config?: string;
  configName?: string;
  configRegister?: string;
  context?: string;
  d?: boolean;
  debug?: boolean;
  define?: string;
  devtool?: string;
  display?: '' | 'verbose' | 'detailed' | 'normal' | 'minimal' | 'errors-only' | 'none';
  displayCached?: boolean;
  displayCachedAssets?: boolean;
  displayChunks?: boolean;
  displayDepth?: boolean;
  displayEntrypoints?: boolean;
  displayErrorDetails?: boolean;
  displayExclude?: string;
  displayMaxModules?: number;
  displayModules?: boolean;
  displayOptimizationBailout?: boolean;
  displayOrigins?: boolean;
  displayProvidedExports?: boolean;
  displayReasons?: boolean;
  displayUsedExports?: boolean;
  entry?: string;
  env?: string;
  h?: boolean;
  help?: boolean;
  hideModules?: boolean;
  hot?: boolean;
  infoVerbosity?: 'none' | 'info' | 'verbose';
  j?: boolean;
  json?: boolean;
  labeledModules?: boolean;
  mode?: WebpackConfig['mode'];
  moduleBind?: string;
  moduleBindPost?: string;
  moduleBindPre?: string;
  o?: string;
  optimizeMaxChunks?: number;
  optimizeMinChunkSize?: number;
  optimizeMinimize?: boolean;
  output?: string;
  outputChunkFilename?: string;
  outputFilename?: string;
  outputJsonpFunction?: string;
  outputLibrary?: string;
  outputLibraryTarget?: WebpackConfig['target'];
  outputPath?: string;
  outputPathinfo?: boolean;
  outputPublicPath?: string;
  outputSourceMapFilename?: string;
  p?: boolean;
  plugin?: string;
  prefetch?: string;
  profile?: boolean;
  progress?: boolean;
  provide?: string;
  r?: string;
  recordsInputPath?: string;
  recordsOutputPath?: string;
  recordsPath?: string;
  resolveAlias?: string;
  resolveExtensions?: string | string[];
  resolveLoaderAlias?: string;
  silent?: boolean;
  sortAssetsBy?: string;
  sortChunksBy?: string;
  sortModulesBy?: string;
  stdin?: boolean;
  target?: string;
  v?: boolean;
  verbose?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
  watchAggregateTimeout?: number;
  watchPoll?: string;
  watchStdin?: boolean;
}
