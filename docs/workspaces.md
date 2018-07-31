# Workspaces

Beemo has first class support for executing driver commands across workspaces (monorepos), using
[Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) or
[Lerna packages](https://github.com/lerna/lerna#lernajson). Once a tool is configured, execute a
driver command with a `--workspaces` option, which signals Beemo to run this command in each of the
workspace package folders.

This option requires a pattern to match package names against (the name in `package.json`), or `*`
to match all packages. Patterns may need to be quoted.

```
yarn beemo typescript --workspaces=*

// Only in packages that wildcard contain "driver-"
yarn beemo typescript --workspaces=driver-*
```

> Patterns are powered by [micromatch](https://github.com/micromatch/micromatch).

![Beemo](https://raw.githubusercontent.com/milesj/beemo/master/docs/img/workspaces.gif)

## Priority Packages

There are situations where a single package or multiple packages need to be executed before all
other packages, for example, a core/common/main package. This is very common for typed languages
like Flow or TypeScript. Pass a `--priority` option to automatically resolve a priority order based
on the workspaces dependency graph.

```
yarn beemo typescript --workspaces=* --priority
```

High priority packages will be executed synchronously in order of dependency, followed by all
remaining packages being executed in parallel.

## Driver Support

Each driver is designed and built differently, so getting a consistent pattern for workspace support
is quite difficult. Because of this, per driver usage is broken down into 1 of the following 4
categories.

- **Root only** - The driver command should only be ran in the root, with all workspace packages
  being referenced as a whole. For example, recursive globbing.
- **Referenced config** - The driver command is executed in each package, with the root config file
  being referenced using a CLI option (like `--config`).
- **Copied config** - The root config is copied into each package folder before the driver command
  is ran in each. Because of this, we suggest not using the root config for anything else.
- **No support** - Workspaces do not work for this driver.

| Driver     | Support                                            |
| ---------- | -------------------------------------------------- |
| Babel      | Referenced using `--config`                        |
| ESLint     | Root only (preferred), Referenced using `--config` |
| Flow       | Root only                                          |
| Jest       | Root only (preferred), Referenced using `--config` |
| Mocha      | Root only                                          |
| Prettier   | Root only (preferred), Referenced using `--config` |
| TypeScript | Copied                                             |
| Webpack    | N/A                                                |
