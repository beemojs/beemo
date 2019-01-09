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
  tool.on('eslint.before-execute', (driver, argv) => {
    argv.push('--color', '--report-unused-disable-directives');
  });
};
```

## Supported Events

The following list of events, and their arguments, can be listened to.

| Event                            | Arguments                                                                                  | Description                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `exit`                           | `code: number`                                                                             | Called when the process exits, either successfully, or with an error.                                              |
| `<driver>.init-driver`           | `context: DriverContext | ConfigContext, driver: Driver`                                   | Called before a driver is executed with `beemo <driver>` or before a config is created with `beemo create-config`. |
| `<driver>.load-module-config`    | `context: DriverContext | ConfigContext, path: string, config: object`                     | Called after configuration has been loaded from the configuration module.                                          |
| `<driver>.load-package-config`   | `context: DriverContext | ConfigContext, config: object`                                   | Called after configuration has been extracted from `package.json`.                                                 |
| `<driver>.merge-config`          | `context: DriverContext | ConfigContext, config: object`                                   | Called after multiple configuration sources have been merged into 1.                                               |
| `<driver>.create-config-file`    | `context: DriverContext | ConfigContext, path: string, config: object`                     | Called before the configuration file is written.                                                                   |
| `<driver>.copy-config-file`      | `context: DriverContext | ConfigContext, path: string, config: object, sourcePath: string` | Called before the configuration file is copied from module.                                                        |
| `<driver>.reference-config-file` | `context: DriverContext | ConfigContext, path: string, config: object`                     | Called before the configuration file is referenced.                                                                |
| `<driver>.delete-config-file`    | `context: DriverContext, path: string`                                                     | Called before the configuration file is deleted. Occurs during the `cleanup` phase.                                |
| `<driver>.before-execute`        | `context: DriverContext, argv: string[], driver: Driver`                                   | Called before the underlying `Driver` command is executed.                                                         |
| `<driver>.after-execute`         | `context: DriverContext, response: any, driver: Driver`                                    | Called after the driver has successfully been executed.                                                            |
| `<driver>.failed-execute`        | `context: DriverContext, error: Error, driver: Driver`                                     | Called after the driver has failed to execute.                                                                     |
| `<script>.init-script`           | `context: ScriptContext, scriptName: string`                                               | Called before a custom script is executed with `beemo run-script <script>`.                                        |
| `<script>.load-script`           | `context: ScriptContext, script: Script`                                                   | Called after a `Script` has been loaded and instantiated from the configuration module.                            |
| `<script>.before-execute`        | `context: ScriptContext, argv: string[], script: Script`                                   | Called before the `Script#run` method is executed.                                                                 |
| `<script>.after-execute`         | `context: ScriptContext, response: any, script: Script`                                    | Called after the script has successfully been executed.                                                            |
| `<script>.failed-execute`        | `context: ScriptContext, error: Error, script: Script`                                     | Called after the script has failed to execute.                                                                     |
| `<app>.resolve-dependencies`     | `context: DriverContext | ConfigContext, drivers: Driver[]`                                | Called after a list of `Driver`s have been resolved in which to create configuration files.                        |
| `<app>.scaffold`                 | `context: ScaffoldContext, generator: string, action: string`                              | Called before templates are generated when scaffolding.                                                            |

> `<driver>` and `<script>` should be replaced with their names.

> `<app>` is the name of a [custom executeable](./tips.md#custom-executable--config-name), or
> "beemo" when not defined.

### Type Declarations

- `Driver` - An instance of the
  [Driver](https://github.com/milesj/beemo/blob/master/packages/core/src/Driver.ts) class.
- `Script` - An instance of the
  [Script](https://github.com/milesj/beemo/blob/master/packages/core/src/Script.ts) class.
- `Context`, `DriverContext`, `ScriptContext`, `ScaffoldContext` -
  [Special objects](https://github.com/milesj/beemo/tree/master/packages/core/src/contexts) passed
  through the entire execution process.
