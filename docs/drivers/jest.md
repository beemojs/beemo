# Jest Driver

Provides [Jest](https://github.com/facebook/jest) support by dynamically generating a
`jest.config.js` config file.

```
yarn add @beemo/driver-jest jest
```

## Requirements

- [Babel ^7.0.0](./babel.md)
- Jest ^24.0.0

## Usage

In your configuration module, install the driver, Jest, and [Babel](./babel.md). Create a file at
`configs/jest.js` in which to house your Jest configuration.

In your consuming project, enable the driver by adding `jest` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["jest"]
  }
}
```
