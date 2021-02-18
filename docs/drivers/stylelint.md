# Stylelint driver

Provides [Stylelint](https://stylelint.io/) support by dynamically generating a `.stylelintrc.js`
config file.

```bash
yarn add @beemo/driver-stylelint stylelint
```

## Requirements

- stylelint ^13.0.0

## Usage

In your configuration module, install the driver, stylelint, and any plugins. Create a file at
`<config-module>/configs/stylelint.(js|ts)` in which to house your stylelint configuration.

In your consuming project, enable the driver by adding `stylelint` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['stylelint'],
};
```

## Events

| Event                | Arguments                                                          | Description                               |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `onCreateIgnoreFile` | `context: ConfigContext, path: Path, config: { ignore: string[] }` | Called before the ignore file is written. |

## Ignoring paths

Instead of using an `.stylelintignore` dotfile, you can define an `ignore` property in your config
file. This property accepts an array of strings. For example:

```bash
# .stylelintignore
lib/
*.min.js
*.map
```

Becomes...

```js
// .config/beemo/stylelint.js
module.exports = {
  // ...
  ignore: ['lib/', '*.min.js', '*.map'],
};
```

This feature follows the same configuration lifecycle as `.stylelintrc.js`, with the added benefit
of conditional logic, and being generated at runtime!
