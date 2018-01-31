# Jest Driver

Provides [Jest](https://github.com/facebook/jest) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.


## Installation

```
yarn add @beemo/driver-jest jest
// Or
npm install @beemo/driver-jest jest --save
```

## Usage

In your configuration module, install the driver, Jest, and [Babel](../driver-babel). Create a
file at `configs/jest.js` in which to house your Jest configuration.

In your consuming project, enable the driver by adding `jest` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).
