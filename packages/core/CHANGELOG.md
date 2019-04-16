# 1.0.0

#### 💥 Breaking

- Migrated to the new [@boost/event](https://milesj.gitbook.io/boost/event) system.
- Script names (on the command line) will now error if not in kebab case.
- Scripts and Drivers now require an explicit `blueprint` method.
- Renamed `Context#root` to `cwd`.
- Renamed `Driver#handleFailure` to `processFailure`.
- Renamed `Driver#handleSuccess` to `processSuccess`.
- Removed `DriverContext#eventName` and `ScriptContext#eventName`.
- Removed `ScriptContext#binName`. Use `scriptName` instead.

#### 🚀 Updates

- Added a new package,
  [@beemo/dependency-graph](https://www.npmjs.com/package/@beemo/dependency-graph), to handle the
  dependency resolution.
- Added a `none` strategy to `Driver`s. With this strategy, the consumer will need to manually
  create a config file.
- Added a `versionOption` metadata setting to `Driver`s.
- Added `Script#executeCommand`, so that local binaries can easily be executed.
- Added optional `name` support to scaffolding.
- Updated the driver/script execution pipeline to process in parallel batches.

#### 🐞 Fixes

- Fixed script `this` scope being lost within script tasks.
- Fixed the Beemo emoji not appearing in the console.

#### 🛠 Internals

- `Beemo` now extends from `Tool` instead of managing an instance.
- Updated `hygen` to v4.
- Updated dependencies.
