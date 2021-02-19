# Mocha driver

Provides [Mocha](https://github.com/facebook/mocha) support by dynamically generating a
`.mocharc.js` config file.

```bash
yarn add @beemo/driver-mocha mocha
```

## Requirements

- Mocha ^8.0.0

## Usage

In your configuration module, install the driver and Mocha. Create a file at
`<config-module>/configs/mocha.(js|ts)` in which to house your Mocha configuration.

In your consuming project, enable the driver by adding `mocha` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['mocha'],
};
```
