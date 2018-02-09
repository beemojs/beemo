# ESLint Driver

Provides [ESLint](https://github.com/eslint/eslint) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.

## Installation

```
yarn add @beemo/driver-eslint eslint
// Or
npm install @beemo/driver-eslint eslint --save
```

## Usage

In your configuration module, install the driver, ESLint, and any plugins. Create a file at
`configs/eslint.js` in which to house your ESLint configuration.

In your consuming project, enable the driver by adding `eslint` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).

### Ignoring Paths

Instead of using an `.eslintignore` dotfile, you can define an `ignore` property in your  
`configs/eslint.js` file. This property accepts an array of strings. For example:

```bash
# dotfiles/eslintignore
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
