# Flow Driver

Provides [Flow](https://github.com/facebook/flow) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.


## Installation

```
yarn add @beemo/driver-flow flow-bin
// Or
npm install @beemo/driver-flow flow-bin --save
```

## Usage

In your configuration module, install the driver and Flow. Create a file at `configs/flow.js` in
which to house your Flow configuration.

In your consuming project, enable the driver by adding `flow` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).

### Config Format

In Beemo, Flow is configured using a JavaScript file, and not the `.flowconfig` file. To
support this, the following conventions must be followed.

* `ignore`, `include`, and `libs` are an array of strings.
* `lints` is an object. Properties are snake case (underscored instead of dashed).
* `options` is an object. Properties with periods in them denote nested objects.
  * `suppress_comment` must be double escaped.
* `version` is a string.

An example:

```js
// configs/flow.js
module.exports = {
  ignore: [
    '.*/node_modules/.*',
    '.*/tests/.*',
    '.*\\.test\\.js',
  ],
  include: [
    './src',
  ],
  lints: {
    untyped_import: 'warn',
  },
  options: {
    emoji: true,
    module: {
      ignore_non_literal_requires: true,
    },
    suppress_comment: '\\\\(.\\\\|\\n\\\\)*\\\\$FlowFixMe',
  },
};
```
