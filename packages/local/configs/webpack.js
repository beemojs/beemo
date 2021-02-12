'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const webpack_1 = __importDefault(require('webpack'));
const config = {
  devtool: 'cheap-source-map',
  mode: 'development',
  plugins: [new webpack_1.default.EnvironmentPlugin(['NODE_ENV'])],
  target: 'web',
};
exports.default = config;
