const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-source-map',
  mode: 'development',
  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])],
  target: 'web',
};
