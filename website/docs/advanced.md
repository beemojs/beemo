---
title: Advanced
---

Some useful tips and advanced features on utilizing Beemo like a pro!

## Local Beemo setup

Beemo requires an external Node module (the configuration module) to run correctly, but technically,
it can be setup locally to not require an external module. This is perfect for large applications,
monorepos, or for testing your configuration module itself!

In your Beemo config, use `@local` instead of the name of your configuration module. This will use
the current working directory (`process.cwd()`) instead of the Node module path.

```ts title=".config/beemo.ts"
export default {
  module: '@local',
};
```

> If your configuration module is using [workspaces](./workspaces.md) (monorepo), you can target the
> package name directly, assuming Yarn or Lerna have symlinked Node modules.

## Ignoring configuration

By default, Beemo generates local config files at runtime, all of which may constantly change based
on outside variables. These changes will clutter your commit history, so let's ignore them all
together!

Do so by adding file names to `.gitignore` (or another VCS) for each driver you have installed in
your configuration module. Be sure `config.cleanup` is disabled in your `beemo` config (is `false`
by default).

```bash
// .gitignore
.eslintrc.js
prettier.config.js
```

With these changes, the local config files will persist after executing a driver, but will also be
ignored in your VCS. Pretty nice huh?

## Editor integration

Some editors utilize the config files files for in-editor functionality (like ESLint and Prettier),
but if these config files are ignored (tip above), then the editor experience would be sub-par until
the user generated the files.

To work around this, we can define a `prepare` script to create all config files, which runs after
every `yarn install` or `npm install`.

```json title="package.json"
{
  "scripts": {
    "prepare": "beemo create-config --silent"
  }
}
```

## Glob expansion

Most scripts require [Bash filename expansion](http://tldp.org/LDP/abs/html/globbingref.html) to
glob multiple filesystem paths, but this isn't entirely efficient or accurate, as Bash only supports
a subset of the RE specification, nor does it support wildcards like `**` (recursive search).

To work around this limitation, Beemo implements its own version of filename expansion using the
[glob package](https://www.npmjs.com/package/glob). Simply wrap your command line argument in quotes
to use it!

```bash
# Before
yarn beemo eslint ./packages/*/{src,tests}

# After
yarn beemo eslint "./packages/*/{src,tests}"
```

> This approach has an additional benefit of not cluttering `stdout`.

In some cases, a glob pattern can match too many files, and exceed the maximum size for arguments
passed to a command. To work around this set `expandGlobs` to `false` in the Driver options. For
this to work correctly, the underlying tool must correctly handle the glob patterns you pass in.

## Parallel commands

Multiple commands for the same driver can be run in parallel by passing one or many `//` parallel
operators. Each operator may include multiple arguments or options.

For example, if you'd like to run separate ESLint commands in different folders.

```bash
yarn beemo eslint --color // ./src --ext=.ts,.tsx // ./tests --report-unused-disable-directives

# Would run 2 commands in parallel
eslint --color ./src --ext=.ts,.tsx
eslint --color ./tests --report-unused-disable-directives
```

> Parallel defined arguments are not accessible within the configuration file, as the file has
> already been created using the initially passed non-parallel arguments. However, depending on the
> driver, some argument may be available under `process.beemo.context.args`.

## Custom settings

Beemo supports custom project level configuration through the `settings` property. A property which
accepts an object of any key-value pair. This property is not used by Beemo itself, so is free from
any possible collisions.

```js title=".config/beemo.ts"
export default {
  module: '<config-module>',
  settings: {
    whateverYouWant: 'here',
    coolRight: true,
  },
};
```

These settings can then be accessed through the [tool instance](./tool.md).

```js
tool.config.settings.coolRight; // boolean
```

## Branded tooling

The Beemo command line and configuration can be renamed to offer a better and more immersive
branding experience, especially when used at a large company. To start, create a new executable in
your configuration module at `bin/<name>.js` (name must be camel-case), with the following contents
(which simply runs Beemo's console).

In the upcoming examples, we will use "BMO" as the brand, but feel free to plug in whatever you'd
like.

```js
#!/usr/bin/env node

// Name of your company, project, etc in a human-readable format
process.env.BEEMO_BRAND_NAME = 'BMO';

// Name of the command line binary in camel-case
process.env.BEEMO_BRAND_BINARY = 'bmo';

// NPM configuration module that houses shared configs and the binary itself
process.env.BEEMO_CONFIG_MODULE = '@bmo/dev';

// Custom documentation website to display in help output
process.env.BEEMO_MANUAL_URL = 'https://custom/manual/url';

require('@beemo/cli/bin');
```

Be sure to reference your new executable in your configuration module's `package.json`.

```json title="package.json"
{
  "bin": {
    "bmo": "./bin/bmo.js"
  }
}
```

If `BEEMO_CONFIG_MODULE` is not defined in your custom binary (above), each consumer will need to
manually configure it.

```js title=".config/bmo.ts"
export default {
  module: '@bmo/dev',
};
```

### Does change

- Binary executable name and project title: `bmo run-driver babel`
- Config file names: `.config/bmo.js`, `.config/bmo/babel.js`, etc
- Beemo process global: `process.bmo`
- Debug namespace: `DEBUG=bmo:*`

### Does not change

- Driver and script package names: `@beemo/driver-babel`, `beemo-script-build`, etc

## CLI themes

Beemo is built on [Boost](https://boostlib.dev/docs/cli#themes), a powerful dev tool framework,
which provides the ability to theme the command line output (by changing important colors). To
activate a theme, pass a `BOOSTJS_CLI_THEME` environment variable with the name of the theme.

```bash
BOOSTJS_CLI_THEME=one-dark yarn beemo babel
```

> View the list of available themes on the
> [official Boost repository](https://github.com/milesj/boost/tree/master/themes).
