# 0.27.0

#### 💥 Breaking

- `Script`s now extend Boost `Plugin` instead of `Routine`.
  - Inherits `Script#bootstrap` and `Script#blueprint` functionality.
- `Script#execute` now calls `Script#executeTasks('serial')` by default now.

#### 🚀 New

- Scripts can additionally be loaded from NPM modules that match the format of
  `beemo-script-<name>`.
- Added `Script#executeTasks` to process enqueued tasks using the defined pipeline type (`parallel`,
  `pool`, `serial` (default), `sync`).
- Added `Script#task` to enqueue tasks similar to previous Boost routines.

# 0.26.0 - 2019-01-08

#### 💥 Breaking

- `Script` file names must now be pascal case: `foo-bar.js` -> `FooBar.js`.
- `ScriptContext#scriptPath` has been renamed to `path`.

#### 🚀 New

- Updated `beemo create-config` to create a config for all enabled drivers if no args are passed.
- Added `--live` to `beemo <driver>` to view output live instead of on completion.
- Added `DriverContext#eventName` property.
- Added `ScriptContext#eventName` property.

#### 🛠 Internal

- Updated to Boost 1.4 which includes a new CLI engine.

# 0.25.0 - 2018-12-29

#### 💥 Breaking

- `Script`s now extend Boost `Routine`, providing more functionality.
  - `parse()` was renamed to `args()`.
  - `run(options, tool)` was renamed to `execute(context, options)`.

#### 🚀 New

- Added _experimental_ support for capturing watch output from drivers.
- Added `watchOptions` metadata field to `Driver`. Defines CLI watch options to intercept for the
  defined driver.
