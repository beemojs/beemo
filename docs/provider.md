# Repository Setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `build-tool-config`, or
`dev-tools`, etc, as it's straight forward, easy to understand, and defines intent.

```
git clone git@github.com:<username>/build-tool-config.git
cd build-tool-config/
```

Once cloned, initialize a new NPM package, and provide the name `build-tool-config` with a username
scope, like `@beemo/build-tool-config`. Why a scope? Because we don't want to clutter NPM with dumb
packages. It also avoids collisions and easily announces ownership.

```
npm init --scope=<username>
```

Enter `0.0.0` for the version, and whatever you want for the remaining questions.

## Installing Beemo

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

> Drivers and their peer dependencies must be installed as production dependencies.

## Drivers

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

Each configuration file should return a JavaScript object. Easy enough.

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

If you return a function, you can access the args that were passed on the command line, and the
current [tool instance](./tool.md), which allows for runtime conditional logic. For example, if
`--react` was passed, we can enable the React preset.

```js
// configs/babel.js
module.exports = function(args, tool) {
  const presets = [
    [
      'babel-preset-env',
      {
        targets: { node: '6.5' },
      },
    ],
  ];

  if (args.react) {
    presets.push('babel-preset-react');
  }

  return {
    presets,
  };
};
```

If for some reason you cannot return a function, but would like to still access the context and
tool, you can reference the current Beemo instance using `process.beemo`.

```js
// configs/babel.js
const { context, tool } = process.beemo;
const presets = [
  [
    'babel-preset-env',
    {
      targets: { node: '6.5' },
    },
  ],
];

if (context.args.react) {
  presets.push('babel-preset-react');
}

module.exports = {
  presets,
};
```

> Command line arguments are parsed into an object using
> [yargs-parser](https://www.npmjs.com/package/yargs-parser).

## Dotfiles

Beemo supports [synchronizing dotfiles](./consumer.md#synchronizing-dotfiles) across all projects
that consume your configuration module (the repository you just created). This includes things like
`.gitignore`, `.npmignore`, `.travis.yml`, and more. This _does not_ include configuration dotfiles
like `.babelrc` and `.flowconfig`, as those are handled automatically by the drivers mentioned
above.

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

## Scripts

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

The `run()` method is required and is triggered when the `beemo run-script` command is ran. This
method receives options (parsed with `parse()`) as the 1st argument, and the current
[Beemo Tool instance](./tool.md) as the 2nd argument.

> Returning a promise in `run()` is preferred.

## Publishing

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
