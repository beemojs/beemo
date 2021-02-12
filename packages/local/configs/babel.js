'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config = {
  babelrc: false,
  comments: false,
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-proposal-export-default-from',
    [
      'babel-plugin-transform-dev',
      {
        evaluate: false,
      },
    ],
    'babel-plugin-typescript-to-proptypes',
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: process.version.slice(1) } }],
    '@babel/preset-typescript',
  ],
};
exports.default = config;
