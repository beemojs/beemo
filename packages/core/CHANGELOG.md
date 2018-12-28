# 0.25.0

#### 💥 Breaking

- Minimum supported Node.js version is v10.9.
- `Script` now extends Boost `Routine`, providing more functionality.
  - `parse()` was renamed to `args()`.
  - `run(options, tool)` was renamed to `execute(context, options)`.

#### 🚀 New

- Added `watchOptions` metadata field to `Driver`. Defines CLI watch options to intercept for the
  defined driver.

# 0.6.0

#### 💥 Breaking

- Added `dependencies` option to drivers.
- Renamed `config/` folder to `configs/`.
