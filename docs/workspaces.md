# Workspaces

Beemo has first class support for executing driver commands across workspaces (monorepos), using
[Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) or
[Lerna packages](https://github.com/lerna/lerna#lernajson). Once one of these tools are configured,
execute a driver command while passing a `--workspaces` option, which in turn signals Beemo to run
this command in each of the workspace packages.

This option requires a pattern to match package names against (the name of the folder on the
filesystem), or `*` to match all packages. Patterns may need to be quoted.

```
yarn beemo typescript --workspaces=*

// Only in packages that start with "driver-"
yarn beemo typescript --workspaces=driver-*
```

> Patterns are powered by [micromatch](https://github.com/micromatch/micromatch).

![Beemo](https://raw.githubusercontent.com/milesj/beemo/master/docs/img/workspaces.gif)

## Priority Packages

There are situations where a specific package(s) needs to be executed before all other packages, for
example, a core/common package. This is very common for typed languages like Flow or TypeScript. To
mark a package as high priority, pass a `--priority` option with a comma separated list of package
names.

```
yarn beemo typescript --workspaces=* --priority=core,utils
```

High priority packages will be executed synchronously in order of definition, followed by all
remaining packages being executed in parallel.

> Patterns are also supported here.

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
