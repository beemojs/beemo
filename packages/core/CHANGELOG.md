# 1.0.0

#### 💥 Breaking

- Script names (on the command line) will now error if not in kebab case.
- Renamed `Context#root` to `cwd`.
- Removed `ScriptContext#binName`. Use `scriptName` instead.

#### 🚀 Updates

- Added a new package,
  [@beemo/dependency-graph](https://www.npmjs.com/package/@beemo/dependency-graph), to handle the
  dependency resolution.
- Added a `none` strategy option to `Driver`s. With this strategy, the consumer will need to
  manually create a config file.
- Added `Script#executeCommand`, so that local binaries can easily be executed.
- Added optional `name` support to scaffolding.

#### 🐞 Fixes

- Fixed script `this` context being lost within script tasks.
- Fixed the Beemo emoji not appearing in the console.

#### 🛠 Internals

- Updated `hygen` to v4.
- Updated dependencies.
