---
title: Driver usage
---

A driver is a pluggable interface for an individual development or build tool. It provides a custom
implementation for interoperability with the primary Beemo process.

## Config strategies

Each driver is designed and built differently, as is their configuration patterns. To work around
this, multiple strategies are in play when generating a config file at the root.

- **Created config** - The config file is dynamically generated from the configuration module's
  source config file. Typically written with `JSON.stringify()`.
- **Referenced config** - The config file references the configuration module's source config file
  using `require()`. Typically required for complex files (contains class instances, etc), like
  Webpack. _Note:_ When referencing, the `process.beemo` variable is not available.
- **Copied config** - The config file is copied as is from the configuration module's source config
  file.
- **Template created config** - The config is dynamically generated from the cusomer using a custom
  template function. This template controls both the config file contents and destination path.
- **Native config** - Uses the native configuration strategy defined for the driver.
- **No config** - Does nothing. Requires the consumer to create a local config file.

The default strategies for each tool are as follows:

| Strategy   | Driver                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| Created    | Babel, ESLint, Flow, Jest, Lerna, Mocha, Prettier, Stylelint, TypeScript |
| Referenced | Rollup, Webpack                                                          |

> Default strategies can be overwritten with a driver's `configStrategy` option.

## Output strategies

Since Beemo executes drivers in a sub-process, we offer multiple strategies on how to display the
driver's output.

- **Buffered** - Driver output will be buffered and hidden until the Beemo process completes. Upon
  completion, the buffered output will be logged _after_ Beemo's output.
- **Piped** - Driver output will be logged _above_ and in parallel with Beemo's output.
- **Streamed** - Beemo's output will be hidden and the driver output will be logged instead. This
  output is akin to running the driver outside of Beemo.
- **No output** - Neither Beemo's or the driver's output will be displayed.

> Default strategy is to buffer, but this can be customized per driver with the `outputStrategy`
> option, or for all drivers through the `execute.output` config setting.

## Creating a driver

Will be available after release!
