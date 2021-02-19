# Rollup driver

Provides [Rollup](https://github.com/rollup/rollup) support by dynamically generating a
`rollup.config.js` config file.

```bash
yarn add @beemo/driver-rollup rollup
```

## Requirements

- Rollup ^2.0.0

## Usage

In your configuration module, install the driver, Rollup, and any loaders or plugins. Create a file
at `<config-module>/configs/rollup.(js|ts)` in which to house your Rollup configuration.

In your consuming project, enable the driver by adding `rollup` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['rollup'],
};
```
