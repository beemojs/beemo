# Flow driver

Provides [Flow](https://github.com/facebook/flow) support by dynamically generating a `.flowconfig`
config file.

```bash
yarn add @beemo/driver-flow flow-bin
```

## Requirements

- Flow

## Usage

In your configuration module, install the driver and Flow. Create a file at
`<config-module>/configs/flow.(js|ts)` in which to house your Flow configuration.

In your consuming project, enable the driver by adding `flow` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['flow'],
};
```

## Config format

In Beemo, Flow is configured using a JavaScript file, and not the `.flowconfig` file. To support
this, the following conventions must be followed.

- `ignore`, `include`, and `libs` are an array of strings.
- `lints` is an object. Properties are snake case (underscored instead of dashed).
- `options` is an object.
  - Properties with a period must be quoted.
  - `suppress_comment` must be double escaped or use `RegExp`.
- `version` is a string.

An example:

```js
// .config/beemo/flow.js
module.exports = {
  ignore: ['.*/node_modules/.*', '.*/tests/.*', '.*\\.test\\.js'],
  include: ['./src'],
  lints: {
    untyped_import: 'warn',
  },
  options: {
    emoji: true,
    'module.ignore_non_literal_requires': true,
    suppress_comment: '\\\\(.\\\\|\\n\\\\)*\\\\$FlowFixMe',
  },
};
```
