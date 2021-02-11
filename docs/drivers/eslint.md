# ESLint Driver

Provides [ESLint](https://github.com/eslint/eslint) support by dynamically generating a
`.eslintrc.js` config file.

```
yarn add @beemo/driver-eslint eslint
```

## Requirements

- ESLint ^7.0.0

## Usage

In your configuration module, install the driver, ESLint, and any plugins. Create a file at
`configs/eslint.js` or `lib/configs/eslint.js` in which to house your ESLint configuration.

In your consuming project, enable the driver by adding `eslint` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["eslint"]
  }
}
```

## Events

| Event                | Arguments                                                          | Description                               |
| -------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `onCreateIgnoreFile` | `context: ConfigContext, path: Path, config: { ignore: string[] }` | Called before the ignore file is written. |

## Ignoring Paths

Instead of using an `.eslintignore` dotfile, you can define an `ignore` property in your
`configs/eslint.js` file. This property accepts an array of strings. For example:

```bash
# .eslintignore
lib/
*.min.js
*.map
```

Becomes...

```js
// configs/eslint.js
module.exports = {
  // ...
  ignore: ['lib/', '*.min.js', '*.map'],
};
```

This feature follows the same configuration lifecycle as `.eslintrc`, with the added benefit of
conditional logic, and being generated at runtime!
