# 🤖 Beemo

Manage build tools, their configuration, and commands in a single centralized repository.
Beemo aims to solve the multi-project maintenance fatigue by removing the following burdens across
all projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, continuous copy and paste, and more.

### Features

* Manage all build tools and configurations in a single repository.
* Configure all build tools using `.js` files.
* Customize and alter config at runtime with CLI options.
* Pass custom CLI options to build tool commands without failure.
* Easily share config between build tools.
* Avoid relative config or `extend` paths.
* Automatic config file cleanup.
* Dotfile synchronization.
* And much more.

### How does it work?

TODO

## Requirements

* Node 6.5+

## Documentation

* [Repository Setup](#repository-setup)
  * [Installing Beemo](#installing-beemo)
  * [Configuring Drivers](#configuring-drivers)
  * [Adding Dotfiles](#adding-dotfiles)
  * [Publishing](#publishing)
* [Consumer Setup](#consumer-setup)
  * [Synchronizing Dotfiles](#synchronizing-dotfiles)
  * [Using Drivers](#using-drivers)
  * [Executing Drivers](#executing-drivers)

### Repository Setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `build-tool-config`,
as it's straight forward, easy to understand, and defines intent.

```
git clone git@github.com:<username>/build-tool-config.git
cd build-tool-config/
```

Once cloned, initialize a new NPM package, and provide the name `build-tool-config` with your
username scope, like `@beemo/build-tool-config`. Why a scope? Because we don't want to
clutter NPM with dumb packages. It also avoids collisions and easily announces ownership.

```
npm init --scope=<username>
```

Enter `0.0.0` for the version, and whatever you want on the remaining questions.

#### Installing Beemo

Now that we have a repository, we can install and setup Beemo. It's as easy as...

```
yarn add @beemo/core
```

This will only install the core functionality. To support different build tools like Babel,
ESLint, and Jest, we need to install packages known as "drivers" ([view all available drivers](https://www.npmjs.com/search?q=beemo-driver)).

```
yarn add @beemo/driver-babel babel-core
yarn add @beemo/driver-eslint eslint
yarn add @beemo/driver-jest jest
```

> Be sure to install required peer dependencies!

#### Configuring Drivers

For each driver you install, there should be an associated `.js` configuration file within a
`config/` folder, named after the package name (excluding "driver-"). Using the example above,
we'd have the following:

```
config/
  babel.js
  eslint.js
  jest.js
```

> The benefit of Beemo is that we can avoid build tool conventions and standardize on a single
> implementation. No more `.foorc`, `.foorc.js`, or `.foorc.json` nonsense. Just `config/foo.js`.

Each configuration file should return a JavaScript object. Sounds easy enough.

```js
// config/babel.js
module.exports = {
  presets: [
    ['babel-preset-env', {
      targets: { node: '6.5' },
    }],
  ],
};
```

If you return a function, you can access the options that were passed on the command line,
which allows for runtime conditional logic. For example, if `--react` was passed, we can enable
the React preset.

```js
// config/babel.js
module.exports = function (options) {
  const presets = [
    ['babel-preset-env', {
      targets: { node: '6.5' },
    }],
  ];

  if (options.react) {
    presets.push('babel-preset-react');
  }

  return {
    presets,
  };
};
```

> Command line arguments are parsed into an object using [yargs-parser](https://www.npmjs.com/package/yargs-parser).

#### Adding Dotfiles

Beemo supports [synchronizing dotfiles](#synchronizing-dotfiles) across all projects that consume
your configuration module (the repository you just created). This includes things like
`.gitignore`, `.npmignore`, `.travis.yml`, and more. This *does not* include configuration
dotfiles like `.babelrc` and `.flowconfig`, as those are handled automatically by the drivers
mentioned above.

To begin, create a `dotfiles/` folder.

```
mkdir dotfiles/
```

Then add dotfiles you want to synchronize, without the leading `.`. For example, `.gitignore`
would simply be `gitignore`. Why no leading period? Well, because otherwise, those dotfiles and
their functionality would be applied to your repository (git will actually ignore files). So to
get around this, we remove the period, and then rename the file after synchronizing. If all goes
well, you should have a folder structure like the following.

```
dotfiles/
  gitignore
  npmignore
  travis.yml
```

#### Publishing

Now that Beemo and its drivers are installed, let's move forward by publishing your configuration
module to NPM with public access. This is mandatory if using a scope.

```
npm version minor
npm publish --access=public
```

You can also set the access in `package.json`.

```
"publishConfig": {
  "access": "public"
},
```

### Consumer Setup

Now that you have a configuration module, we can integrate it across all projects. But first,
go ahead and delete all the old config files and dependencies in each project (if they exist),
as all that logic should now be housed in your configuration module.

Once you have a clean slate, install Beemo's CLI and your configuration module.

```
yarn add @beemo/cli --dev
yarn add @<username>/build-tool-config --dev
```

Add a `beemo` configuration block to your `package.json`, with a `config` property that matches
the name of your configuration module, or another third-party module.

```json
{
  "beemo": {
    "config": "@<username>/build-tool-config"
  }
}
```

> Configuration can also be defined in a `config/beemo.js` file.

##### Options

* `config` (string) - Name of your configuration module.
* `configure.parallel` (boolean) - Create configuration files in parallel. Defaults to `true`.
* `debug` (boolean) - Enable debug output. Can be toggled with `--debug`. Defaults to `false`.
* `drivers` (string[]|object[]) - List of drivers to enable for the consumer.
* `execute.cleanup` (boolean) - Remove generated config files after execution. Defaults to `true`.
* `silent` (boolean) - Hide Beemo output. Can be toggled with `--silent`. Defaults to `false`.

> Periods denote nested objects.

#### Synchronizing Dotfiles

#### Using Drivers

#### Executing Drivers
