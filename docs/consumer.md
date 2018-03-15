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

### Options

* `module` (string) - Name of your configuration module.
* `config.cleanup` (boolean) - Remove generated config files after execution. Defaults to `false`.
* `config.parallel` (boolean) - Create configuration files in parallel. Defaults to `true`.
* `debug` (boolean) - Enable debug output. Can be toggled with `--debug`. Defaults to `false`.
* `drivers` (string[]|object[]) - List of drivers to enable for the consumer.
* `silent` (boolean) - Hide Beemo output. Can be toggled with `--silent`. Defaults to `false`.

> Periods denote nested objects.

## Synchronizing Dotfiles

Once Beemo is setup in your project, and you have dotfiles within your configuration module, you can
run `yarn beemo sync-dotfiles` (or `npx beemo sync-dotfiles`) to copy them into the project.

This process is a simple copy and write, so previous files will be overwritten. Be sure to
`git diff` and verify your changes!

### Filtering Files

Not all dotfiles may be required, so you can filter them using the `--filter` option. This option
accepts a string which will be used as a regex pattern.

```
yarn beemo sync-dotfiles --filter "*.yml"
```

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
        "env": { "MAX_WORKERS": 2 }
      }
    ]
  }
}
```

### Options

* `driver` (string) - The name of the driver module. Required when using an object.
* `args` (string[]) - Arguments to always pass when executing the driver binary, and to pass to the
  config file.
* `dependencies` (string[]) - Other drivers that are required for this driver to run.
* `env` (object) - Environment variables to pass when executing the driver binary with
  [execa](https://github.com/sindresorhus/execa).

## Executing Drivers

Now for the fun part, executing the driver! It's as simple as `yarn beemo <driver>` (or
`npx beemo <driver>`). Once entered, this will initialize Beemo's pipeline, generate a temporary
configuration file, execute the underlying driver binary, handle stdout and stderr output, cleanup
after itself, and lastly, leave a beautiful message in your terminal.

> All arguments passed to Beemo are passed to the driver's underlying binary.

That being said, consistently remembering the correct commands and arguments to pass to `yarn` and
`npx` is tedious. So why not use scripts? Feel free to steal the following.

```json
{
  "scripts": {
    "babel": "beemo babel ./src --out-dir ./lib",
    "eslint": "beemo eslint ./src ./tests",
    "flow": "beemo flow check",
    "jest": "beemo jest",
    "prettier": "beemo prettier --write \"./{src,tests}/**/*.{js,json,md}\"",
    "posttest": "yarn run flow --silent",
    "pretest": "yarn run eslint --silent",
    "test": "yarn run jest --silent"
  }
}
```

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
