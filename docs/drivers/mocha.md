# Mocha Driver

Provides [Mocha](https://github.com/facebook/mocha) support by dynamically generating a `mocha.opts`
config file.

```
yarn add @beemo/driver-mocha mocha
```

## Requirements

- Mocha ^5.0.0

## Usage

In your configuration module, install the driver and Mocha. Create a file at `configs/mocha.js` in
which to house your Mocha configuration.

In your consuming project, enable the driver by adding `mocha` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["mocha"]
  }
}
```

## Config Format

In Beemo, Mocha is configured using a JavaScript file, and not the `mocha.opts` file. To support
this, the following conventions must be followed.

- Properties are snake case (underscored instead of dashed).
- Options with multiple values are defined as an array of strings.
- Shorthand flags are not supported (example: use `--colors` instead of `-c`).

An example:

```js
// configs/mocha.js
module.exports = {
  check_leaks: true,
  colors: true,
  full_trace: true,
  reporter: 'nyan',
  watch_extensions: ['.jsx', '.mjs'],
};
```
