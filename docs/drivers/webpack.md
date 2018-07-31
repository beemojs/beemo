# Webpack Driver

Provides [Webpack](https://github.com/webpack/webpack) support by dynamically generating a
`webpack.config.js` config file.

```
yarn add @beemo/driver-webpack webpack webpack-cli
```

## Requirements

- Webpack ^4.0.0

## Usage

In your configuration module, install the driver, Webpack, and any loaders or plugins. Create a file
at `configs/webpack.js` in which to house your Webpack configuration.

In your consuming project, enable the driver by adding `webpack` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["webpack"]
  }
}
```
