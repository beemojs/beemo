# Listening To Events

What kind of tool would Beemo be without the ability to listen to events? A terrible one, and as
such, Beemo totally supports them! Events provide an easy mechanism for hooking into the lifecycle
of a Beemo process.

To begin, create an `index.js` file in the root of your configuration module that exports a
function. This function will receive a [Beemo Tool instance](./tool.md) for the current process, in
which listeners can be registered.

```js
// index.js
module.exports = function(tool) {
  // Add command line args to every execution
  tool.getPlugin('driver', 'eslint').onBeforeExecute.listen(context => {
    context.argv.push('--color', '--report-unused-disable-directives');
  });
};
```

## Supported Events

The following list of events, and their arguments, can be listened to.

### Tool

| Event                   | Arguments                                                                    | Type   | Description                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `onExit`                | `code: number`                                                               | Normal | Called when the process exits, either successfully, or with an error.                                     |
| `onLoadPlugin`          | `plugin: Driver | Script`                                                    | Normal | Called after a plugin is loaded and registered into the tool. _Requires a scope of `driver` or `script`._ |
| `onResolveDependencies` | `context: ConfigContext, drivers: Driver[]`                                  | Normal | Called after a list of `Driver`s have been resolved in which to create configuration files.               |
| `onRunConfig`           | `context: ConfigContext, driverNames: string[]`                              | Normal | Called before `beemo create-config` is ran.                                                               |
| `onRunDriver`           | `context: DriverContext, driver: Driver`                                     | Normal | Called before `beemo <driver>` is ran. _Requires a scope of the driver name._                             |
| `onRunScript`           | `context: ScriptContext`                                                     | Normal | Called before `beemo run-script <script>` is ran. _Requires a scope of the script name._                  |
| `onScaffold`            | `context: ScaffoldContext, generator: string, action: string, name?: string` | Normal | Called before templates are generated when scaffolding.                                                   |

### Driver

| Event                   | Arguments                                              | Type       | Description                                                                         |
| ----------------------- | ------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------- |
| `onAfterExecute`        | `context: DriverContext, response: unknown`            | Concurrent | Called after the driver has successfully been executed.                             |
| `onBeforeExecute`       | `context: DriverContext, argv: string[]`               | Concurrent | Called before the underlying `Driver` binary command is executed.                   |
| `onCreateConfigFile`    | `context: ConfigContext, path: string, config: object` | Normal     | Called before the configuration file is written.                                    |
| `onCopyConfigFile`      | `context: ConfigContext, path: string, config: object` | Normal     | Called before the configuration file is copied from module.                         |
| `onDeleteConfigFile`    | `context: ConfigContext, path: string`                 | Normal     | Called before the configuration file is deleted. Occurs during the `cleanup` phase. |
| `onFailedExecute`       | `context: DriverContext, error: Error`                 | Concurrent | Called after the driver has failed to execute.                                      |
| `onLoadModuleConfig`    | `context: ConfigContext, path: string, config: object` | Normal     | Called after configuration has been loaded from the configuration module.           |
| `onLoadPackageConfig`   | `context: ConfigContext, config: object`               | Normal     | Called after configuration has been extracted from `package.json`.                  |
| `onMergeConfig`         | `context: ConfigContext, config: object`               | Normal     | Called after multiple configuration sources have been merged into 1.                |
| `onReferenceConfigFile` | `context: ConfigContext, path: string, config: object` | Normal     | Called before the configuration file is referenced.                                 |

### Script

| Event             | Arguments                                   | Type       | Description                                             |
| ----------------- | ------------------------------------------- | ---------- | ------------------------------------------------------- |
| `onAfterExecute`  | `context: ScriptContext, response: unknown` | Concurrent | Called after the script has successfully been executed. |
| `onBeforeExecute` | `context: ScriptContext, argv: string[]`    | Concurrent | Called before the `Script#execute` method is ran.       |
| `onFailedExecute` | `context: ScriptContext, error: Error`      | Concurrent | Called after the script has failed to execute.          |

## Type Declarations

- `Driver` - An instance of the
  [Driver](https://github.com/beemojs/beemo/blob/master/packages/core/src/Driver.ts) class.
- `Script` - An instance of the
  [Script](https://github.com/beemojs/beemo/blob/master/packages/core/src/Script.ts) class.
- `Context`, `DriverContext`, `ScriptContext`, `ScaffoldContext` -
  [Special objects](https://github.com/beemojs/beemo/tree/master/packages/core/src/contexts) passed
  through the entire execution process.
