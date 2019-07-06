# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 1.0.3 - 2019-07-06

#### 🐞 Fixes

- Persist exit code when driver executions fail. [#54] ([fdf0b10](https://github.com/beemojs/beemo/tree/master/packages/core/commit/fdf0b10)), closes [#54](https://github.com/beemojs/beemo/tree/master/packages/core/issues/54)

#### 📦 Dependencies

- Updated boost to v1.2. Migrate APIs. ([0a01612](https://github.com/beemojs/beemo/tree/master/packages/core/commit/0a01612))
- Updated build deps. ([bfa490c](https://github.com/beemojs/beemo/tree/master/packages/core/commit/bfa490c))
- Updated driver deps. ([5ed870d](https://github.com/beemojs/beemo/tree/master/packages/core/commit/5ed870d))
- Updated execa to v2. ([b5bec8c](https://github.com/beemojs/beemo/tree/master/packages/core/commit/b5bec8c))
- Updated fast-glob to v3. ([84b6497](https://github.com/beemojs/beemo/tree/master/packages/core/commit/84b6497))
- Updated fs-extra to v8.1. ([3faf131](https://github.com/beemojs/beemo/tree/master/packages/core/commit/3faf131))

#### 🛠 Internals

- Utilize generated tsconfig.json files. (#56) ([788843e](https://github.com/beemojs/beemo/tree/master/packages/core/commit/788843e)), closes [#56](https://github.com/beemojs/beemo/tree/master/packages/core/issues/56)

**Note:** Version bump only for package @beemo/core





### 1.0.2 - 2019-06-15

#### 🐞 Fixes

- Add debugging around child processes. Handle OOM errors. ([fbf9e19](https://github.com/beemojs/beemo/tree/master/packages/core/commit/fbf9e19))

**Note:** Version bump only for package @beemo/core





### 1.0.1 - 2019-06-13

#### 📦 Dependencies

- Bump to latest. Fix peers and vulnerabilities. (#53) ([f8ba055](https://github.com/beemojs/beemo/tree/master/packages/core/commit/f8ba055)), closes [#53](https://github.com/beemojs/beemo/tree/master/packages/core/issues/53)

#### 🛠 Internals

- Setup DangerJS and conventional changelog (#52) ([c253bf6](https://github.com/beemojs/beemo/tree/master/packages/core/commit/c253bf6)), closes [#52](https://github.com/beemojs/beemo/tree/master/packages/core/issues/52)

**Note:** Version bump only for package @beemo/core





# 1.0.0 - 2019-05-18

#### 💥 Breaking

- Migrated to the new [@boost/event](https://milesj.gitbook.io/boost/event) system.
- Script names (on the command line) will now error if not in kebab case.
- Scripts and Drivers now require an explicit `blueprint` method.
- Renamed `--live` option to `--stdio`.
- Renamed `--priority` option to `--graph`.
- Renamed `execute.priority` setting to `execute.graph`.
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
