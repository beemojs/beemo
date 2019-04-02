# Prettier Driver

Provides [Prettier](https://github.com/prettier/prettier) support by dynamically generating a
`prettier.config.js` config file.

```
yarn add @beemo/driver-prettier prettier
```

## Requirements

- Prettier ^1.0.0

## Usage

In your configuration module, install the driver and Prettier. Create a file at
`configs/prettier.js` in which to house your Prettier configuration.

In your consuming project, enable the driver by adding `prettier` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["prettier"]
  }
}
```

## Events

| Event                         | Arguments                                                                            | Description                               |
| ----------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------- |
| `prettier.create-ignore-file` | `context: DriverContext | ConfigContext, path: string, config: { ignore: string[] }` | Called before the ignore file is written. |

## Ignoring Paths

Instead of using an `.prettierignore` dotfile, you can define an `ignore` property in your
`configs/prettier.js` file. This property accepts an array of strings. For example:

```bash
# .prettierignore
lib/
*.min.js
```

Becomes...

```js
// configs/prettier.js
module.exports = {
  // ...
  ignore: ['lib/', '*.min.js'],
};
```

This feature follows the same configuration lifecycle as `prettier.config.js`, with the added
benefit of conditional logic, and being generated at runtime!
