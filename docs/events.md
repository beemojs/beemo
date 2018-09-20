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

| Event                            | Arguments                                                | Description                                                                                 |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `exit`                           | `code: number`                                           | Called when the process exits, either successfully, or with an error.                       |
| `<driver>.init-driver`           | `driver: Driver, context: DriverContext`                 | Called before a driver is executed with `beemo <driver>`.                                   |
| `<driver>.resolve-dependencies`  | `drivers: Driver[]`                                      | Called after a list of `Driver`s have been resolved in which to create configuration files. |
| `<driver>.load-module-config`    | `path: string, config: object`                           | Called after configuration has been loaded from the configuration module.                   |
| `<driver>.load-package-config`   | `config: object`                                         | Called after configuration has been extracted from `package.json`.                          |
| `<driver>.merge-config`          | `config: object`                                         | Called after multiple configuration sources have been merged into 1.                        |
| `<driver>.create-config-file`    | `path: string, config: object`                           | Called before the configuration file is written.                                            |
| `<driver>.copy-config-file`      | `path: string, config: object, sourcePath: string`       | Called before the configuration file is copied from module.                                 |
| `<driver>.reference-config-file` | `path: string, config: object`                           | Called before the configuration file is referenced.                                         |
| `<driver>.delete-config-file`    | `path: string`                                           | Called before the configuration file is deleted. Occurs during the `cleanup` phase.         |
| `<driver>.before-execute`        | `driver: Driver, argv: string[], context: DriverContext` | Called before the underlying `Driver` command is executed.                                  |
| `<driver>.after-execute`         | `driver: Driver, response: any`                          | Called after the driver has successfully been executed.                                     |
| `<driver>.failed-execute`        | `driver: Driver, error: Error`                           | Called after the driver has failed to execute.                                              |
| `<script>.init-script`           | `scriptName: string, context: ScriptContext`             | Called before a custom script is executed with `beemo run-script <script>`.                 |
| `<script>.load-script`           | `script: Script`                                         | Called after a `Script` has been loaded and instantiated from the configuration module.     |
| `<script>.before-execute`        | `script: Script, argv: string[], context: ScriptContext` | Called before the `Script#run` method is executed.                                          |
| `<script>.after-execute`         | `script: Script, response: any`                          | Called after the script has successfully been executed.                                     |
| `<script>.failed-execute`        | `script: Script, error: Error`                           | Called after the script has failed to execute.                                              |
| `<app>.scaffold`                 | `context: Context, generator: string, action: string`    | Called before templates are generated when scaffolding.                                     |

> `<driver>` and `<script>` should be replaced with their names.

> `<app>` is the name of a [custom executeable](./tips.md#custom-executable--config-name), or
> "beemo" when not defined.

### Type Declarations

- `Driver` - An instance of the
  [Driver](https://github.com/milesj/beemo/blob/master/packages/core/src/Driver.js) class.
- `Script` - An instance of the
  [Script](https://github.com/milesj/beemo/blob/master/packages/core/src/Script.js) class.
- `Context`, `DriverContext`, `ScriptContext` -
  [Special object types](https://github.com/milesj/beemo/blob/master/packages/core/src/types.js#L53)
  passed through the entire execution process.
