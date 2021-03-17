---
title: Drivers
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
- **Native config** - Uses the configuration strategy defined for the driver.
- **No config** - Does nothing. Requires the consumer to create a local config file.

The default strategies for each tool are as follows:

| Driver     | Strategy   |
| ---------- | ---------- |
| Babel      | Created    |
| ESLint     | Created    |
| Flow       | Created    |
| Jest       | Created    |
| Lerna      | Created    |
| Mocha      | Created    |
| Prettier   | Created    |
| Rollup     | Referenced |
| Stylelint  | Created    |
| TypeScript | Created    |
| Webpack    | Referenced |

> Default strategies can be overwritten with a driver's `strategy` option, which accepts `create`,
> `reference`, `copy`, `template`, `native`, and `none`.

## Creating a driver

Will be available after release!
