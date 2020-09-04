# TypeScript Driver

Provides [TypeScript](https://github.com/microsoft/typescript) support by dynamically generating a
`tsconfig.json` config file.

```
yarn add @beemo/driver-typescript typescript
```

## Requirements

- TypeScript ^2.0.0 || ^3.0.0 || ^4.0.0

## Usage

In your configuration module, install the driver and TypeScript. Create a file at
`configs/typescript.js` or `lib/configs/typescript.js` in which to house your TypeScript
configuration.

In your consuming project, enable the driver by adding `typescript` to your `drivers` config.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": ["typescript"]
  }
}
```

### CLI Options

- `--[no-]clean` (bool) - Clean the target `outDir` before transpiling. Defaults to `true`.
- `--reference-workspaces` (bool) - Automatically generate project references based on workspace
  dependency graph. Defaults to `false`.

## Events

| Event                       | Arguments                                                                        | Description                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `onCreateProjectConfigFile` | `context: DriverContext, path: Path, config: TypeScriptConfig, isTests: boolean` | Called before a workspace package config file is written when using project references. |

## Workspaces Support

TypeScript supports 2 forms of workspaces, the 1st with native
[project references](https://www.typescriptlang.org/docs/handbook/project-references.html), and the
2nd with the [Beemo --workspaces](../workspaces.md) implementation.

### Project References

Managing project references manually can be tedious, and honestly, quite hard. Beemo mitigates this
process by automating the creation of `tsconfig.json` files, with correct project references (based
on `dependencies` and `peerDependencies`), in every workspace package. To opt-in to this feature,
pass `--reference-workspaces` alongside `--build`.

By default, the config will compile a `src` folder into a `lib` folder, while including a local
`types` folder. A `tests` folder will receive a custom config file, which type checks the folder but
does not compile. A represenation of this is as follows:

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
    tsconfig.json # Created
types/ # Global types folder
tsconfig.json # Created with refs that point to each package
```

To customize this process, the following options are available.

- `buildFolder` (string) - Name of output directory relative to package root. Defaults to `lib`.
- `declarationOnly` (bool) - Only emit declaration files for all packages instead of source files.
  Defaults to `false`.
- `globalTypes` (bool) - Include global types defined in the root (usually cwd). Defaults to
  `false`.
- `srcFolder` (string) - Name of source directory relative to package root. Defaults to `src`.
- `testsFolder` (string) - Name of tests directory relative to package root. Defaults to `tests`.
- `typesFolder` (string) - Name of local and global types directory. Defaults to `types`.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "drivers": [
      {
        "driver": "typescript",
        "globalTypes": true,
        "testsFolder": "test"
      }
    ]
  }
}
```

> If your tests are co-located with your source files, the tests specific `tsconfig.json` file will
> be skipped.

### Beemo Workspaces

When using Beemo workspaces, the TypeScript driver will copy the `tsconfig.json` from the root into
each package, instead of referencing with a `--project` option, or using `extends` (which has many
issues with relative paths). It will then execute a child process in each package, in the correct
order, based on the dependency graph.

This works great if the root config is never used, but the situations where _it may be_ (for
example, with Jest), then custom logic will need to be added to your `configs/typescript.js` file to
handle both cases. Something like the following.

```js
// configs/typescript.js
module.exports = function typescript(args, tool) {
  // The --workspaces option is not passed, but the project uses workspaces.
  const runningInWorkspaceEnabledRoot = !args.workspaces && !!tool.package.workspaces;

  return {
    include: [runningInWorkspaceEnabledRoot ? './packages/*/src/**/*' : './src/**/*'],
  };
};
```
