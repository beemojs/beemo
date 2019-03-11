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

#### 🛠 Internals

- Updated `hygen` to v3.
- Updated dependencies.
