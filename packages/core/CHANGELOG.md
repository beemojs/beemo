# 0.25.0

#### 💥 Breaking

- `Script` now extends Boost `Routine`, providing more functionality.
  - `parse()` was renamed to `args()`.
  - `run(options, tool)` was renamed to `execute(context, options)`.

# 0.6.0

#### 💥 Breaking

- Added `dependencies` option to drivers.
- Renamed `config/` folder to `configs/`.
