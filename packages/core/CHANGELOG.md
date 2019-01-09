# 0.26.0 - 2018-01-08

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

- `Script` now extends Boost `Routine`, providing more functionality.
  - `parse()` was renamed to `args()`.
  - `run(options, tool)` was renamed to `execute(context, options)`.

#### 🚀 New

- Added _experimental_ support for capturing watch output from drivers.
- Added `watchOptions` metadata field to `Driver`. Defines CLI watch options to intercept for the
  defined driver.
