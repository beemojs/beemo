import { BabelConfig } from '@beemo/driver-babel';

const config: BabelConfig = {
  babelrc: false,
  comments: false,
  plugins: ['@babel/plugin-proposal-class-properties'],
  presets: [
    ['@babel/preset-env', { targets: { node: process.version.slice(1) } }],
    '@babel/preset-typescript',
  ],
};

export default config;
