# TypeScript driver

Provides [TypeScript](https://github.com/microsoft/typescript) support by dynamically generating a
`tsconfig.json` config file.

```bash
yarn add @beemo/driver-typescript typescript
```

> If using workspaces, the driver will assume and use project references, by injecting `references`
> into the root config automatically, and separating compiler options into a `tsconfig.options.json`
> file.

## Requirements

- TypeScript ^4.0.0

## Usage

In your configuration module, install the driver and TypeScript. Create a file at
`<config-module>/configs/typescript.(js|ts)` in which to house your TypeScript configuration.

In your consuming project, enable the driver by adding `typescript` to your `drivers` config.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['typescript'],
};
```

### CLI options

- `--[no-]clean` (bool) - Clean the target `outDir` before transpiling. Defaults to `true`.

## Events

| Event                       | Arguments                                                | Description                                                                             |
| --------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `onCreateProjectConfigFile` | `path: Path, config: TypeScriptConfig, isTests: boolean` | Called before a workspace package config file is written when using project references. |

## Commands

### `sync-project-refs`

Managing [project references](https://www.typescriptlang.org/docs/handbook/project-references.html)
manually can be tedious, and honestly, quite hard. Beemo mitigates this by automating the creation
of `tsconfig.json` files, with correct project references (based on package dependencies), in every
workspace package.

Run the following command in your project root to make use of this.

```bash
beemo typescript:sync-project-refs
```

By default, the config will compile a `src` folder into a `lib` folder, while including a local and
global `types` folder. A `tests` folder will receive a custom config file, which type checks the
folder but does not compile. A represenation of this is as follows:

```bash
packages/
  foo/
    src/
    tsconfig.json # Created that compiles src/ to lib/
  bar
    src/
    types/ # Local types folder
    tsconfig.json # Created that includes types/ folder
  baz
    src/
    tests/
      tsconfig.json # Created for tests only
    tsconfig.json
types/ # Global types folder
tsconfig.json # Created with refs that point to each package
```

To customize this process, the following options are available.

- `buildFolder` (`string`) - Name of output directory relative to package root. Defaults to `lib`.
- `declarationOnly` (`boolean`) - Only emit declaration files for all packages instead of source
  files. Defaults to `false`.
- `globalTypes` (`boolean`) - Include global types defined in the root (usually cwd). Defaults to
  `false`.
- `srcFolder` (`string`) - Name of source directory relative to package root. Defaults to `src`.
- `testsFolder` (`string`) - Name of tests directory relative to package root. Defaults to `tests`.
- `typesFolder` (`string`) - Name of local and global types directory. Defaults to `types`.

```js
module.exports = {
  module: '<config-module>',
  drivers: {
    typescript: {
      globalTypes: true,
      testsFolder: 'test',
    },
  },
};
```

> If your tests are co-located with your source files, the tests specific `tsconfig.json` file will
> be skipped.
