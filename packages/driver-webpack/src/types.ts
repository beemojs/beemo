import { Configuration } from 'webpack';

export interface WebpackConfig extends Configuration {}

export interface WebpackArgs {
  c?: string;
  color?: boolean;
  config?: string;
  configName?: string;
  d?: string;
  devtool?: boolean | string;
  entry?: string[] | string;
  env?: string;
  h?: boolean;
  help?: boolean;
  j?: string;
  json?: string;
  m?: boolean;
  merge?: boolean;
  mode?: WebpackConfig['mode'];
  name?: string;
  o?: string;
  outputPath?: string;
  progress?: string;
  stats?: WebpackConfig['stats'];
  t?: string;
  target?: string;
  v?: boolean;
  version?: boolean;
  w?: boolean;
  watch?: boolean;
  watchOptionsStdin?: boolean;
}
