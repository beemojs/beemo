# Babel Driver

Provides [Babel](https://github.com/babel/babel) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.

## Installation

```
yarn add @beemo/driver-babel babel-core
// Or
npm install @beemo/driver-babel babel-core --save
```

## Usage

In your configuration module, install the driver, Babel, and any plugins and presets. Create a file
at `configs/babel.js` in which to house your Babel configuration.

In your consuming project, enable the driver by adding `babel` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).

#### CLI Options

* `--[no-]clean` (bool) - Clean the target `--out-dir` before transpiling. Defaults to `true`.
