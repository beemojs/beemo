# Prettier Driver

Provides [Prettier](https://github.com/prettier/prettier) support.

## Usage

In your configuration module, install the driver and Prettier. Create a file at
`configs/prettier.js` in which to house your Prettier configuration.

In your consuming project, enable the driver by adding `prettier` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["prettier"]
  }
}
```
