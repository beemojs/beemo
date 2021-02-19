# Lerna driver

Provides [Lerna](https://github.com/lerna/lerna) support by dynamically generating a `lerna.json`
config file.

```bash
yarn add @beemo/driver-lerna lerna
```

## Requirements

- Lerna ^3.0.0

## Usage

In your configuration module, install the driver and Lerna. Create a file at
`<config-module>/configs/lerna.(js|ts)` in which to house your Lerna configuration.

In your consuming project, enable the driver by adding `lerna` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['lerna'],
};
```
