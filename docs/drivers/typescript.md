# TypeScript Driver

Provides [TypeScript](https://github.com/microsoft/typescript) support by dynamically generating a
`tsconfig.json` config file.

```
yarn add @beemo/driver-typescript typescript
```

## Requirements

- TypeScript ^2.0.0 || ^3.0.0

## Usage

In your configuration module, install the driver and TypeScript. Create a file at
`configs/typescript.js` in which to house your TypeScript configuration.

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

## Workspaces Support

TypeScript natively does not support workspaces by default. However, with Beemo, workspaces are
possible with only minor degradation in functionality. When [using workspaces](../workspaces.md),
TypeScript will copy the `tsconfig.json` from the root into each package, instead of referencing
with a `--project` option, or using `extends` (which has many issues with relative paths).

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
