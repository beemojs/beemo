# Prettier driver

Provides [Prettier](https://github.com/prettier/prettier) support by dynamically generating a
`prettier.config.js` config file.

```bash
yarn add @beemo/driver-prettier prettier
```

## Requirements

- Prettier ^2.0.0

## Usage

In your configuration module, install the driver and Prettier. Create a file at
`<config-module>/configs/prettier.(js|ts)`in which to house your Prettier configuration.

In your consuming project, enable the driver by adding `prettier` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['prettier'],
};
```

## Events

| Event                | Arguments                                                          | Description                               |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `onCreateIgnoreFile` | `context: ConfigContext, path: Path, config: { ignore: string[] }` | Called before the ignore file is written. |

## Ignoring paths

Instead of using an `.prettierignore` dotfile, you can define an `ignore` property in your config
file. This property accepts an array of strings. For example:

```
# .prettierignore
lib/
*.min.js
```

Becomes...

```js
// .config/beemo/prettier.js
module.exports = {
  // ...
  ignore: ['lib/', '*.min.js'],
};
```

This feature follows the same configuration lifecycle as `prettier.config.js`, with the added
benefit of conditional logic, and being generated at runtime!
