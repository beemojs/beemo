# Mocha Driver

Provides [Mocha](https://github.com/facebook/mocha) support by dynamically generating a `mocha.opts`
config file.

```
yarn add @beemo/driver-mocha mocha
```

## Requirements

- Mocha ^8.0.0

## Usage

In your configuration module, install the driver and Mocha. Create a file at `configs/mocha.js` or
`lib/configs/mocha.js` in which to house your Mocha configuration.

In your consuming project, enable the driver by adding `mocha` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["mocha"]
  }
}
```
