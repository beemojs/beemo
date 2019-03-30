# Repository Setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `dev-tools`, or
`dev-tool-config`, `build-tools`, etc, as it's straight forward, easy to understand, and defines
intent.

```
git clone git@github.com:<username>/dev-tools.git
cd dev-tools/
```

Once cloned, initialize a new NPM package, and provide the name `dev-tools` with a username scope,
like `@beemo/dev-tools`. Why a scope? Because we don't want to clutter NPM with dumb packages. It
also avoids collisions and easily announces ownership.

```
npm init --scope=<username>
```

Enter `0.0.0` for the version, and whatever you want for the remaining questions.

## Installing Beemo

Now that we have a repository, we can install and setup Beemo. It's as easy as...

```
yarn add @beemo/core @beemo/cli
```

This will only install the core functionality. To support different dev tools like Babel, ESLint,
and Jest, we need to install packages known as "drivers"
([view all available drivers](https://www.npmjs.com/search?q=beemo-driver)).

```
yarn add @beemo/driver-babel @babel/core
yarn add @beemo/driver-eslint eslint
yarn add @beemo/driver-jest jest
```

> Drivers and their peer dependencies must be installed as production dependencies.

## Drivers

For each driver you install, there should be an associated `.js` configuration file within a
`configs/` folder, named after the camel-cased package name (excluding "driver-"). Using the example
above, we'd have the following:

```
configs/
  babel.js
  eslint.js
  jest.js
```

> The benefit of Beemo is that we can avoid dev tool conventions and standardize on a single
> implementation. No more `.foorc`, `.foorc.js`, or `.foorc.json` nonsense. Just `configs/foo.js`.

Each configuration file should return a JavaScript object. Easy enough.

```js
// configs/babel.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '6.5' },
      },
    ],
  ],
};
```

You can access the command line args, the pipeline context, and the current
[tool instance](./tool.md) on `process.beemo` (which allows for runtime conditional logic). For
example, if `--react` was passed, we can enable the React preset.

```js
// configs/babel.js
const { context, tool } = process.beemo;
const presets = [
  [
    '@babel/preset-env',
    {
      targets: { node: '6.5' },
    },
  ],
];

if (context.args.react) {
  presets.push('@babel/preset-react');
}

module.exports = {
  presets,
};
```

> Command line arguments are parsed into an object using
> [yargs-parser](https://www.npmjs.com/package/yargs-parser).

## Scripts

Beemo supports executing custom scripts found within your configuration module. To utilize a script,
create a JavaScript file within the `scripts/` folder, extend the `Script` class provided by Beemo,
and define the `execute()` and `args()` methods.

```js
// scripts/init.js
const { Script } = require('@beemo/core');

module.exports = class InitScript extends Script {
  args() {
    return {
      boolean: ['dryRun'],
    };
  }

  execute(context, options) {
    if (options.dryRun) {
      // Do something
    }
  }
};
```

The `args()` method is optional and can be used to define parsing rules for CLI options (powered by
[yargs-parser](https://www.npmjs.com/package/yargs-parser#api)). If no rules are provided, Yargs
default parsing rules will be used.

The `execute()` method is required and is triggered when the `beemo run-script` command is ran. This
method receives the current pipeline context as the 1st argument and options (parsed with `parse()`)
as the 2nd argument. The [Beemo Tool instance](./tool.md) is available under `this.tool`.

> Returning a promise in `execute()` is preferred.

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
