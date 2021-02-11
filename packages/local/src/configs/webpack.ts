import webpack from 'webpack';
import { WebpackConfig } from '@beemo/driver-webpack';

const config: WebpackConfig = {
  devtool: 'cheap-source-map',
  mode: 'development',
  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])],
  target: 'web',
};

export default config;
