# Mocha Driver

Provides [Mocha](https://github.com/facebook/mocha) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.


## Installation

```
yarn add @beemo/driver-mocha mocha
// Or
npm install @beemo/driver-mocha mocha --save
```

## Usage

In your configuration module, install the driver and Mocha. Create a file at `configs/mocha.js`
in which to house your Mocha configuration.

In your consuming project, enable the driver by adding `mocha` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).
