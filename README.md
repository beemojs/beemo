# 🤖 Droid

Manage build tools, their configuration, and all commands in a single centralized repository.
Droid aims to solve the multi-project maintenance fatigue by removing the following burdens across
all projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, and continuous copy and paste.

### Features

* Manage all build tools in a single repository.
* Configure all build tools using `.js` files.
* Customize and alter config at runtime through CLI options.
* Pass custom CLI options to build tool commands.
* Easily share config between build tools.
* Automatic config file cleanup.
* Dotfile synchronization.
* And much more.

## Requirements

* Node 6.5+

## Documentation

* [Repository Setup](#repository-setup)
  * [Installing Droid](#installing-droid)
  * [Configuring Engines](#configuring-engines)
  * [Adding Dotfiles](#adding-dotfiles)

### Repository Setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `build-tool-config`,
as it's straight forward, easy to understand, and defines intent.

```
git clone git@github.com:<username>/build-tool-config.git
cd build-tool-config/
```

Once cloned, initialize a new NPM package, and provide the name `build-tool-config` with your
username scope, like `@droid/build-tool-config`. Why a scope? Because we don't want to
clutter NPM with dumb packages. It also avoids collisions and easily announces ownership.

```
npm init --scope=droid
```

Enter `0.0.0` for the version, and whatever you want on the remaining questions. Let's move
forward by immediately publishing the package to NPM with public access. This is mandatory if
using a scope.

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

#### Installing Droid

Now that we have a repository, we can install and setup Droid. It's as easy as...

```
yarn add @droid/core
```

This will only install the core functionality. To support different build tools like Babel,
ESLint, and Jest, we need to install packages known as "engines" ([view all available engines](https://www.npmjs.com/search?q=babel-plugin)).

```
yarn add @droid/engine-babel babel-core
yarn add @droid/engine-eslint eslint
yarn add @droid/engine-jest jest
```

> Be sure to install required peer dependencies!

#### Configuring Engines

For each engine you install, there should be an associated `.js` configuration file within a
`config/` folder, named after the package name (excluding "engine-"). Using the example above,
we'd have the following:

```
config/
  babel.js
  eslint.js
  jest.js
```

> The benefit of Droid is that we can avoid build tool conventions and standardize on a single
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

> Command line arguments are parsed into an object using [yargs-parser](https://www.npmjs.com/package/yargs-parser)

#### Adding Dotfiles

Droid supports synchronizing dotfiles across all projects that consume your configuration module
(the repository you just created). This includes things like `.gitignore`, `.npmignore`,
`.travis.yml`, and more. This *does not* include configuration dotfiles like `.babelrc` and
`.flowconfig`, as those are handled automatically by the engines mentioned above.

To begin, create a `dotfiles/` folder.

```
mkdir dotfiles/
```

Then add dotfiles you want to synchronize, without the leading `.`. For example, `.gitignore`
would simply be `gitignore`. Why no leading period? Well, because otherwise, those dotfiles and
their functionality would be applied to your repository (git will actually ignore files). So to
get around this, we remove the period, and then rename the file after synchronizing. If all goes
well, you should have folder structure like the following.

```
dotfiles/
  gitignore
  npmignore
  travis.yml
```
