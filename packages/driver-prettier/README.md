# Prettier Driver

Provides [Prettier](https://github.com/prettier/prettier) support for
[Beemo](https://github.com/milesj/beemo), a build tool manager.

## Installation

```
yarn add @beemo/driver-prettier prettier
// Or
npm install @beemo/driver-prettier prettier --save
```

## Usage

In your configuration module, install the driver and Prettier. Create a file at
`configs/prettier.js` in which to house your Prettier configuration.

In your consuming project, enable the driver by adding `prettier` to your `drivers` config.

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/beemo).
