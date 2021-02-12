# Webpack driver

Provides [Webpack](https://github.com/webpack/webpack) support by dynamically generating a
`webpack.config.js` config file.

```bash
yarn add @beemo/driver-webpack webpack webpack-cli
```

## Requirements

- Webpack ^4.0.0 || ^5.0.0

## Usage

In your configuration module, install the driver, Webpack, and any loaders or plugins. Create a file
at `<config-module>/configs/webpack.(js|ts)` in which to house your Webpack configuration.

In your consuming project, enable the driver by adding `webpack` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['webpack'],
};
```
