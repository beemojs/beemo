"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    babelrc: false,
    comments: false,
    plugins: ['@babel/plugin-proposal-class-properties'],
    presets: [
        ['@babel/preset-env', { targets: { node: process.version.slice(1) } }],
        '@babel/preset-typescript',
    ],
};
exports.default = config;
