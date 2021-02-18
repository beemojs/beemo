# Provider setup

To begin, create and clone a new repository on GitHub (or another VCS). This repository will be
known as your "configuration module" going forward. I suggest naming it `dev`, or `dev-configs`,
`build-tools`, etc, as it's straight forward, easy to understand, and defines intent.

```bash
git clone git@github.com:<username>/dev.git
cd dev/
```

Once cloned, initialize a new NPM package, and provide the package name with a username scope, like
`@beemo/dev`. Why a scope? Because we don't want to clutter NPM with common named packages. It also
avoids collisions and easily announces ownership.

```bash
npm init --scope=<username>
```

Enter `0.0.0` for the version, and whatever you want for the remaining questions.

## Installing Beemo

Now that we have a repository, we can install and setup Beemo. It's as easy as...

```bash
yarn add @beemo/core @beemo/cli
```

This will only install the core functionality. To support different developer tools like Babel,
ESLint, and Jest, we need to install packages known as "drivers"
([view all available drivers](https://www.npmjs.com/search?q=beemo-driver)).

```bash
yarn add @beemo/driver-babel @babel/core
yarn add @beemo/driver-eslint eslint
yarn add @beemo/driver-jest jest
```

> Drivers and their peer dependencies must be installed as production dependencies.

## Drivers

For each driver you install, there should be an associated configuration file within a `configs/`
folder, named after the camel-cased package name (excluding "driver-"). Using the example above,
we'd have the following:

```
configs/
  babel.js
  eslint.js
  jest.js
```

> The benefit of Beemo is that we can avoid different tooling conventions and standardize on a
> single implementation. No more `.foorc`, `.foorc.js`, or `.foorc.json` nonsense. Just
> `configs/<driver>.js`.

Each configuration file should return a JavaScript object. Easy enough.

```js
// configs/babel.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
  ],
};
```

TypeScript configuration files are also supported.

```ts
// configs/babel.ts
import { BabelConfig } from '@beemo/driver-babel';

const config: BabelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
  ],
};

export default config;
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
      targets: { node: 'current' },
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
> [@boost/args](https://milesj.gitbook.io/boost/args).

### Config resolution

Configuration files are looked for and resolved in the following order:

- `configs/<driver>.ts`
- `configs/<driver>.js`
- `src/configs/<driver>.ts`
- `lib/configs/<driver>.js`

## Scripts

Beemo supports executing custom scripts found within your configuration module. To utilize a script,
create a file (in PascalCase) within the `scripts/` folder, extend the `Script` class provided by
Beemo, and define the `execute()` and `parse()` methods.

```js
// scripts/InitProject.js
const { Script } = require('@beemo/core');

class InitProjectScript extends Script {
  name = 'init-project';

  parse() {
    return {
      dryRun: {
        description: 'Execute a dry run',
        type: 'boolean',
      },
    };
  }

  execute(context, args) {
    if (args.dryRun) {
      // Do something
    }
  }
}

module.exports = () => new InitProjectScript();
```

Like configuration files, scripts can also be written in TypeScript.

```ts
// scripts/InitProject.ts
import { Arguments, ParserOptions, Script, ScriptContext } from '@beemo/core';

interface InitProjectOptions {
  dryRun: boolean;
}

class InitProjectScript extends Script<InitProjectOptions> {
  name = 'init-project';

  parse(): ParserOptions<InitProjectOptions> {
    return {
      dryRun: {
        description: 'Execute a dry run',
        type: 'boolean',
      },
    };
  }

  execute(context: ScriptContext, args: Arguments<InitProjectOptions>) {
    if (args.dryRun) {
      // Do something
    }
  }
}

export default () => new InitProjectScript();
```

The `parse()` method is optional but can be used to define parsing rules for CLI options (powered by
[@boost/args](https://milesj.gitbook.io/boost/args)). If no rules are provided, default parsing
rules will be used.

The `execute()` method is required and is triggered when the `beemo run-script` command is ran. This
method receives the current pipeline context as the 1st argument and options (parsed with `parse()`)
as the 2nd argument. The [Beemo Tool instance](./tool.md) is available under `this.tool`.

> Returning a promise in `execute()` is preferred.

### Source resolution

Script files are looked for and resolved in the following order:

- `scripts/<script>.ts`
- `scripts/<script>.js`
- `src/scripts/<script>.ts`
- `lib/scripts/<script>.js`
- `@beemo/script-<script>`
- `beemo-script-<script>`

## Publishing

Now that Beemo and its drivers are installed, let's move forward by publishing your configuration
module to NPM with public access. This is mandatory if using a scope.

```bash
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
