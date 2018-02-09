# 🤖 Beemo [ALPHA]

[![Build Status](https://travis-ci.org/milesj/beemo.svg?branch=master)](https://travis-ci.org/milesj/beemo)

Manage build tools, their configuration, and commands in a single centralized repository. Beemo aims
to solve the multi-project maintenance fatigue by removing the following burdens across all
projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, continuous copy and paste, and more.

### Features

* Manage build tools and configurations in a single repository.
* Configure supported build tools using `.js` files.
* Customize and alter config at runtime with CLI options.
* Pass custom CLI options to build tool commands without failure.
* Easily share config between build tools.
* Avoid relative config or `extend` paths.
* Automatic config file cleanup.
* Custom scripts with CLI options.
* Dotfile synchronization.
* And much more.

### How does it work?

TODO

## Requirements

* Node 6.5+
* GitHub, Bitbucket, or another VCS

## Documentation

* [Repository Setup](#repository-setup)
  * [Installing Beemo](#installing-beemo)
  * [Drivers](#drivers)
  * [Dotfiles](#dotfiles)
  * [Scripts](#scripts)
  * [Publishing](#publishing)
* [Consumer Setup](#consumer-setup)
  * [Synchronizing Dotfiles](#synchronizing-dotfiles)
  * [Using Drivers](#using-drivers)
  * [Executing Drivers](#executing-drivers)
  * [Executing Scripts](#executing-scripts)
  * [Overriding Config](#overriding-config)
* [Creating A Driver](#creating-a-driver)
* [Pro Tips](#pro-tips)
  * [Local Beemo Setup](#local-beemo-setup)
  * [Editor Integration](#editor-integration)

### Repository Setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `build-tool-config`, as it's
straight forward, easy to understand, and defines intent.

```
git clone git@github.com:<username>/build-tool-config.git
cd build-tool-config/
```

Once cloned, initialize a new NPM package, and provide the name `build-tool-config` with your
username scope, like `@beemo/build-tool-config`. Why a scope? Because we don't want to clutter NPM
with dumb packages. It also avoids collisions and easily announces ownership.

```
npm init --scope=<username>
```

Enter `0.0.0` for the version, and whatever you want on the remaining questions.

#### Installing Beemo

Now that we have a repository, we can install and setup Beemo. It's as easy as...

```
yarn add @beemo/core @beemo/cli
```

This will only install the core functionality. To support different build tools like Babel, ESLint,
and Jest, we need to install packages known as "drivers"
([view all available drivers](https://www.npmjs.com/search?q=beemo-driver)).

```
yarn add @beemo/driver-babel babel-core
yarn add @beemo/driver-eslint eslint
yarn add @beemo/driver-jest jest
```

> Drivers and their peer dependencies must not be installed as development dependencies.

#### Drivers

For each driver you install, there should be an associated `.js` configuration file within a
`configs/` folder, named after the package name (excluding "driver-"). Using the example above, we'd
have the following:

```
configs/
  babel.js
  eslint.js
  jest.js
```

> The benefit of Beemo is that we can avoid build tool conventions and standardize on a single
> implementation. No more `.foorc`, `.foorc.js`, or `.foorc.json` nonsense. Just `configs/foo.js`.

Each configuration file should return a JavaScript object. Sounds easy enough.

```js
// configs/babel.js
module.exports = {
  presets: [
    [
      'babel-preset-env',
      {
        targets: { node: '6.5' },
      },
    ],
  ],
};
```

If you return a function, you can access the options that were passed on the command line, which
allows for runtime conditional logic. For example, if `--react` was passed, we can enable the React
preset.

```js
// configs/babel.js
module.exports = function(options) {
  const presets = [
    [
      'babel-preset-env',
      {
        targets: { node: '6.5' },
      },
    ],
  ];

  if (options.react) {
    presets.push('babel-preset-react');
  }

  return {
    presets,
  };
};
```

> Command line arguments are parsed into an object using
> [yargs-parser](https://www.npmjs.com/package/yargs-parser).

#### Dotfiles

Beemo supports [synchronizing dotfiles](#synchronizing-dotfiles) across all projects that consume
your configuration module (the repository you just created). This includes things like `.gitignore`,
`.npmignore`, `.travis.yml`, and more. This _does not_ include configuration dotfiles like
`.babelrc` and `.flowconfig`, as those are handled automatically by the drivers mentioned above.

To begin, create a `dotfiles/` folder.

```
mkdir dotfiles/
```

Then add dotfiles you want to synchronize, without the leading `.`. For example, `.gitignore` would
simply be `gitignore`. Why no leading period? Well, because otherwise, those dotfiles and their
functionality would be applied to your repository (git will actually ignore files). So to get around
this, we remove the period, and then rename the file after synchronizing. If all goes well, you
should have a folder structure like the following.

```
dotfiles/
  gitignore
  npmignore
  travis.yml
```

#### Scripts

Beemo supports executing custom scripts found within your configuration module. To utilize a script,
create a JavaScript file within the `scripts/` folder, extend the `Script` class provided by Beemo,
and define the `run()` and `parse()` methods.

```js
// scripts/init.js
const { Script } = require('@beemo/core');

module.exports = class InitScript extends Script {
  parse() {
    return {
      boolean: ['workspaces'],
    };
  }

  run(options, tool) {
    if (options.workspaces) {
      // Do something
    }
  }
};
```

The `parse()` method is optional and can be used to define parsing rules for CLI options (powered by
[yargs-parser](https://www.npmjs.com/package/yargs-parser#api)). If no rules are provided, Yargs
default parsing rules will be used.

The `run()` method is required and is triggered when the `beemo run-script` command is ran. The
method receives options (parsed with `parse()`) as the 1st argument, and the current Beemo tool
instance as the 2nd argument. The tool instance supports the following, which can be used to hook
into the applications lifecycle.

* `config` (object) - Loaded Beemo configuration.
* `package` (object) - Loaded `package.json` found within the current root.
* `debug(message)` - Log debug information (shown during `--debug`).
* `log(message)` - Log information on success.
* `logError(message)` - Log information on failure.

> Returning a promise in `run()` is preferred.

#### Publishing

Now that Beemo and its drivers are installed, let's move forward by publishing your configuration
module to NPM with public access. This is mandatory if using a scope.

```
npm version minor
npm publish --access=public
```

You can also set the access in `package.json`.

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Consumer Setup

Now that you have a configuration module, we can integrate it across all projects. But first, go
ahead and delete all the old config files and dependencies in each project (if they exist), as all
that logic should now be housed in your configuration module.

Once you have a clean slate your configuration module, and BOOM, it's as easy as that. No more
development dependency hell, just a single dependency.

```
yarn add @<username>/build-tool-config --dev
```

That being said, add a `beemo` configuration block to your `package.json`, with a `config` property
that matches the name of your configuration module, or another third-party module.

```json
{
  "beemo": {
    "config": "@<username>/build-tool-config"
  }
}
```

##### Options

* `config` (string) - Name of your configuration module.
* `configure.parallel` (boolean) - Create configuration files in parallel. Defaults to `true`.
* `debug` (boolean) - Enable debug output. Can be toggled with `--debug`. Defaults to `false`.
* `drivers` (string[]|object[]) - List of drivers to enable for the consumer.
* `execute.cleanup` (boolean) - Remove generated config files after execution. Defaults to `false`.
* `silent` (boolean) - Hide Beemo output. Can be toggled with `--silent`. Defaults to `false`.

> Periods denote nested objects.

#### Synchronizing Dotfiles

Once Beemo is setup in your project, and you have dotfiles within your configuration module, you can
run `yarn beemo sync-dotfiles` (or `npx beemo sync-dotfiles`) to copy them into the project.

This process is a simple copy and write, so previous files will be overwritten. Be sure to
`git diff` and verify your changes!

#### Using Drivers

Drivers may have been installed in your configuration module, but that does not make them available
to the current project, as not all drivers will always be necessary. To enable drivers per project,
a `drivers` property must be defined in your `beemo` config.

This property accepts an array of strings or objects, with the names of each driver you want to
enable. For example, if we want to use Babel, ESLint, and Jest, we would have the following.

```json
{
  "beemo": {
    "config": "@<username>/build-tool-config",
    "drivers": ["babel", "eslint", "jest"]
  }
}
```

Furthermore, each driver can be configured with options by using an object, like so.

```json
{
  "beemo": {
    "config": "@<username>/build-tool-config",
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

##### Options

* `driver` (string) - The name of the driver module.
* `args` (string[]) - Arguments to always pass when executing the driver binary, and to pass to the
  config file.
* `dependencies` (string[]) - Other drivers that are required for this driver to run.
* `env` (object) - Environment variables to pass when executing the driver binary with
  [execa](https://github.com/sindresorhus/execa).

#### Executing Drivers

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
    "prettier": "beemo prettier --write ./{src,tests}/**/*.{js,json,md}",
    "posttest": "yarn run flow --silent",
    "pretest": "yarn run eslint --silent",
    "test": "yarn run jest --silent"
  }
}
```

#### Executing Scripts

A script within your configuration module can be executed using `yarn beemo run-script <name>` (or
`npx beemo run-script <name>`).

> All arguments passed to Beemo are passed to the script's `run()` method.

#### Overriding Config

Your configuration module may house all configuration now, but that doesn't mean it's applicable to
_all_ projects. So because of that, Beemo does allow overriding of config. To do so, edit your
`package.json` to include a block under `beemo.<driver>`, like so.

```json
{
  "beemo": {
    "config": "@<username>/build-tool-config",
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

### Creating A Driver

Will be available post-alpha.

### Pro Tips

Some useful tips on utilizing Beemo like a pro!

#### Local Beemo Setup

Beemo requires an external Node module (the configuration module) to run correctly, but technically,
it can be setup locally to not require an external module. This is perfect for large applications,
monorepos, or for testing your configuration module itself!

In your `package.json` Beemo config, use `@local` instead of the name of your configuration module.
This will use the current working directory (`process.cwd()`) instead of the Node module path.

```json
{
  "beemo": {
    "config": "@local"
  }
}
```

#### Editor Integration

By default, Beemo generates local config files at runtime before execution, and some editors utilize
those files for in-editor functionality (like ESLint and Prettier). However, these files clutter
your repository and should not be committed, so let's hide them!

To utilize, add file names to `dotfiles/gitignore` (or another VCS) for each driver you have
installed in your configuration module (be sure to sync afterwards). Also, be sure `cleanup` is
disabled in your `beemo` config (is `false` by default).

```
// dotfiles/gitignore
.eslintrc
.prettierrc
```

With these changes, the local config files will persist after executing a driver, but will also be
ignored in Git. Pretty nice huh?
