# 0.26.0

#### 💥 Breaking

- `Script` file names must now be pascal case: `foo-bar.js` -> `FooBar.js`.
- `ScriptContext#scriptPath` has been renamed to `path`.

#### 🚀 New

- Added `DriverContext#eventName`.
- Added `ScriptContext#eventName`.

# 0.25.0 - 12/29/2018

#### 💥 Breaking

- `Script` now extends Boost `Routine`, providing more functionality.
  - `parse()` was renamed to `args()`.
  - `run(options, tool)` was renamed to `execute(context, options)`.

#### 🚀 New

- Added _experimental_ support for capturing watch output from drivers.
- Added `watchOptions` metadata field to `Driver`. Defines CLI watch options to intercept for the
  defined driver.

# 0.6.0

#### 💥 Breaking

- Added `dependencies` option to drivers.
- Renamed `config/` folder to `configs/`.
