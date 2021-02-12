# ESLint driver

Provides [ESLint](https://github.com/eslint/eslint) support by dynamically generating a
`.eslintrc.js` config file.

```bash
yarn add @beemo/driver-eslint eslint
```

## Requirements

- ESLint ^7.0.0

## Usage

In your configuration module, install the driver, ESLint, and any plugins. Create a file at
`<config-module>/configs/eslint.(js|ts)` in which to house your ESLint configuration.

In your consuming project, enable the driver by adding `eslint` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['eslint'],
};
```

## Events

| Event                | Arguments                                                          | Description                               |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `onCreateIgnoreFile` | `context: ConfigContext, path: Path, config: { ignore: string[] }` | Called before the ignore file is written. |

## Ignoring paths

Instead of using an `.eslintignore` dotfile, you can define an `ignore` property in your config
file. This property accepts an array of strings. For example:

```bash
# .eslintignore
lib/
*.min.js
*.map
```

Becomes...

```js
// .config/beemo/eslint.js
module.exports = {
  // ...
  ignore: ['lib/', '*.min.js', '*.map'],
};
```

This feature follows the same configuration lifecycle as `.eslintrc`, with the added benefit of
conditional logic, and being generated at runtime!
