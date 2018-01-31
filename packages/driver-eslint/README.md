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

In your configuration module, install the driver, ESLint, and any plugins. Create a
file at `configs/eslint.js` in which to house your ESLint configuration.

In your consuming project, enable the driver by adding `eslint` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).
