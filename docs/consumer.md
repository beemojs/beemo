# Consumer Setup

Now that you have a configuration module, we can integrate it across all projects. But first, go
ahead and delete all the old config files and dependencies in each project (if they exist), as all
that logic should now be housed in your configuration module.

Once you have a clean slate, install your configuration module, and BOOM, it's as easy as that. No
more development dependency hell, just a single dependency.

```
yarn add @<username>/build-tool-config --dev
```

That being said, add a `beemo` configuration block to your `package.json`, with a `module` property
that matches the name of your configuration module, or another third-party module.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config"
  }
}
```

### Settings

- `module` (string) - Name of your configuration module.
- `config.cleanup` (bool) - Remove generated config files after execution. Defaults to `false`.
- `config.parallel` (bool) - Create configuration files in parallel. Defaults to `true`.
- `drivers` (string[]|object[]) - List of drivers to enable for the consumer.

> Periods denote nested objects.

## Global CLI Options

The following options are available to all Beemo commands.

- `--debug` (bool) - Print debug logs to the console.
- `--silent` (bool) - Hide all output from the console. [More information](./tips#output-verbosity).
- `--theme` (string) - Change output colors using a theme. [More information](./tips.md#cli-themes).
- `--verbose` (number) - Control the output size sent to the console.
  [More information](./tips#output-verbosity).

## Synchronizing Dotfiles

Once Beemo is setup in your project, and you have dotfiles within your configuration module, you can
run `yarn beemo sync-dotfiles` (or `npx beemo sync-dotfiles`) to copy them into the project.

This process is a simple copy and write, so previous files will be overwritten. Be sure to
`git diff` and verify your changes!

### Filtering Files

Not all dotfiles may be required, so you can filter them using the `--filter` option. This option
accepts a string which will be used as a regex pattern.

```
yarn beemo sync-dotfiles --filter="*.yml"
```

> Filtering is powered by [micromatch](https://github.com/micromatch/micromatch).

## Using Drivers

Drivers may have been installed in your configuration module, but that does not make them available
to the current project, as not all drivers will always be necessary. To enable drivers per project,
a `drivers` property must be defined in your `beemo` config.

This property accepts an array of strings or objects, with the names of each driver you want to
enable. For example, if we want to use Babel, ESLint, and Jest, we would have the following.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["babel", "eslint", "jest"]
  }
}
```

Furthermore, each driver can be configured with options by using an object, like so.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": [
      "babel",
      {
        "driver": "eslint",
        "args": ["--color", "--report-unused-disable-directives"]
      },
      {
        "driver": "jest",
        "env": { "NODE_ENV": "test" }
      }
    ]
  }
}
```

### Options

- `driver` (string) - The name of the driver module. Required when using an object.
- `args` (string[]) - Arguments to always pass when executing the driver binary, and to pass to the
  config file.
- `copy` (bool) - Copy configuration file from module instead of creating it.
- `dependencies` (string[]) - Other drivers that are required for this driver to run.
- `env` (object) - Environment variables to pass when executing the driver binary with
  [execa](https://github.com/sindresorhus/execa).

## Executing Drivers

Now for the fun part, executing the driver! It's as simple as `yarn beemo <driver>` (or
`npx beemo <driver>`). Once entered, this will initialize Beemo's pipeline, generate a temporary
configuration file, execute the underlying driver binary, handle stdout and stderr output, cleanup
after itself, and lastly, leave a beautiful message in your console.

> All arguments passed to Beemo are passed to the driver's underlying binary.

That being said, consistently remembering the correct commands and arguments to pass to `yarn` and
`npx` is tedious. So why not use scripts? Feel free to steal the following.

```json
{
  "scripts": {
    "babel": "beemo babel ./src --out-dir ./lib",
    "eslint": "beemo eslint ./src ./tests",
    "jest": "beemo jest",
    "prettier": "beemo prettier --write \"./{src,tests}/**/*.{js,json,md}\"",
    "posttest": "yarn run eslint",
    "pretest": "yarn run typescript",
    "test": "yarn run jest",
    "typescript": "beemo typescript"
  }
}
```

### CLI Options

The following options are available when executing a driver.

- `--concurrency` (number) - Number of builds to run in parallel. Defaults to the amount of CPUs.
- `--parallel` (string[]) - Execute additional [commands in parallel](./tips.md#parallel-commands).
  Accepts multiple options. _Must be quoted._
- `--priority` (bool) - Prioritize workspace builds based on
  [dependency graph](./workspaces.md#priority-packages).
- `--workspaces` (string) - Execute the command in each [workspace](./workspaces.md) defined by the
  pattern/value. Pass `*` to run in all workspaces.

## Executing Scripts

A script within your configuration module can be executed using `yarn beemo run-script <name>` (or
`npx beemo run-script <name>`).

> All arguments passed to Beemo are passed to the script's `run()` method.

## Overriding Config

Your configuration module may house all configuration now, but that doesn't mean it's applicable to
_all_ projects. So because of that, Beemo does allow overriding of config. To do so, edit your
`package.json` to include a block under `beemo.<driver>`, like so.

```json
{
  "beemo": {
    "module": "@<username>/build-tool-config",
    "drivers": ["eslint"],
    "eslint": {
      "rules": {
        "no-param-reassign": 0
      }
    }
  }
}
```

> Some build tools support `package.json` overrides like this, but it's preferred to use the Beemo
> approach for interoperability.
