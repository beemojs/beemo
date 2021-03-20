---
title: Tool instance
---

A Beemo `Tool` instance is a representation of the current running process. It provides loaded
configuration, driver and script plugins, utility methods, and more.

## Configuration

The loaded consumer configuration can be found under the `config` property.

```ts
tool.config.module;
```

While the `package` property is the loaded consumer `package.json`.

```ts
tool.package.name;
```

## Plugins

Drivers and scripts are managed on the `Tool` instance through a registry based pattern, and can be
accessed with `driverRegistry` and `scriptRegistry` respectively.

```ts
tool.driverRegistry.isRegistered('babel');
tool.driverRegistry.load('@beemo/driver-jest'); // Fully qualified
```
