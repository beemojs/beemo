# Flow Driver

Provides [Flow](https://github.com/facebook/flow) support.

## Usage

In your configuration module, install the driver and Flow. Create a file at `configs/flow.js` in
which to house your Flow configuration.

In your consuming project, enable the driver by adding `flow` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["flow"]
  }
}
```

## Config Format

In Beemo, Flow is configured using a JavaScript file, and not the `.flowconfig` file. To support
this, the following conventions must be followed.

* `ignore`, `include`, and `libs` are an array of strings.
* `lints` is an object. Properties are snake case (underscored instead of dashed).
* `options` is an object.
  * Properties with a period must be quoted.
  * `suppress_comment` must be double escaped or use `RegExp`.
* `version` is a string.

An example:

```js
// configs/flow.js
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
