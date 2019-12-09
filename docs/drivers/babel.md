# Babel Driver

Provides [Babel](https://github.com/babel/babel) support by dynamically generating a
`babel.config.js` config file.

```
yarn add @beemo/driver-babel @babel/core
```

## Requirements

- Babel ^7.0.0

## Usage

In your configuration module, install the driver, Babel, and any plugins and presets. Create a file
at `configs/babel.js` or `lib/configs/babel.js` in which to house your Babel configuration.

In your consuming project, enable the driver by adding `babel` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["babel"]
  }
}
```

> Configuration files that return a function, and expect a Babel `api` instance, are currently not
> supported, as they conflict with Beemo's [configuration functions](../provider.md#drivers).

### CLI Options

- `--[no-]clean` (bool) - Clean the target `--out-dir` before transpiling. Defaults to `true`.
