# Pro Tips

Some useful tips on utilizing Beemo like a pro!

## Local Beemo Setup

Beemo requires an external Node module (the configuration module) to run correctly, but technically,
it can be setup locally to not require an external module. This is perfect for large applications,
monorepos, or for testing your configuration module itself!

In your `package.json` Beemo config, use `@local` instead of the name of your configuration module.
This will use the current working directory (`process.cwd()`) instead of the Node module path.

```json
{
  "beemo": {
    "module": "@local"
  }
}
```

> If your configuration module is using [workspaces](./workspaces.md) (monorepo), you can target the
> package name directly, assuming Yarn or Lerna have symlinked Node modules.

## Editor Integration

By default, Beemo generates local config files at runtime before execution, and some editors utilize
those files for in-editor functionality (like ESLint and Prettier). However, these files clutter
your repository and should not be committed, so let's hide them!

Add file names to `dotfiles/gitignore` (or another VCS) for each driver you have installed in your
configuration module (be sure to sync afterwards). Also, be sure `config.cleanup` is disabled in
your `beemo` config (is `false` by default).

```
// dotfiles/gitignore
.eslintrc.js
prettier.config.js
```

With these changes, the local config files will persist after executing a driver, but will also be
ignored in your VCS. Pretty nice huh?

## Glob Expansion

Most scripts require [Bash filename expansion](http://tldp.org/LDP/abs/html/globbingref.html) to
glob multiple filesystem paths, but this isn't entirely efficient or accurate, as Bash only supports
a subset of the RE specification, nor does it support wildcards like `**` (recursive search).

To work around this limitation, Beemo implements its own version of filename expansion using the
[glob package](https://www.npmjs.com/package/glob). Simply wrap your command line argument in quotes
to use it!

```
// Before
yarn beemo eslint ./packages/*/{src,tests}

// After
yarn beemo eslint "./packages/*/{src,tests}"
```

> This approach has an additional benefit of not cluttering `stdout`.

## Parallel Commands

Multiple commands for the same driver can be run in parallel by passing one or many `//` parallel
operators. Each operator may include multiple arguments or options.

For example, if you'd like to run separate ESLint commands in different folders.

```
yarn beemo eslint --color // ./src --ext=.ts,.tsx // ./tests --report-unused-disable-directives

// Would run 2 commands in parallel
eslint --color ./src --ext=.ts,.tsx
eslint --color ./tests --report-unused-disable-directives
```

> Parallel defined arguments are not accessible within the configuration file, as the file has
> already been created using the initially passed non-parallel arguments. However, depending on the
> driver, some argument may be available under `process.beemo.context.args`.

## Custom Settings

Beemo supports custom project level configuration through the `beemo.settings` property. A property
which accepts an object of any key-value pair. This property is not used by Beemo itself, so is free
from any possible collisions.

```json
{
  "beemo": {
    "module": "@<username>/dev-tools",
    "settings": {
      "whateverYouWant": "here",
      "coolRight": true
    }
  }
}
```

These settings can then be access through the [tool instance](./tool.md).

```js
tool.config.settings.coolRight; // boolean
```

## Custom Executable & Config Name

The Beemo command line executable can be renamed to offer a better and more immersive branding
experience, especially when used at a large company. To start, create a new executable in your
configuration module at `bin/<name>.js`, with the following contents (which simply runs Beemo's
console).

```
#!/usr/bin/env node

process.env.BEEMO_CONFIG_MODULE = '@<custom-username>/dev-tools';
process.env.BEEMO_MANUAL_URL = 'http://custom/manual/url';

require('@beemo/cli');
```

Be sure to reference your new executable in your configuration module's `package.json`.

```json
{
  "bin": {
    "<name>": "./bin/<name>.js"
  }
}
```

If `BEEMO_CONFIG_MODULE` is not defined in your custom binary, you'll need to manually define the
`module` property in the consumer config.

```json
{
  "<name>": {
    "module": "@<custom-username>/dev-tools"
  }
}
```

## Output Verbosity

Console output can be controlled with the `--output` option and a numerical value between 1 and 3
(default). More information is logged the higher the range. To hide all output, use `--silent`
instead.

## CLI Themes

Beemo is built on [Boost](https://github.com/milesj/boost), a powerful dev tool framework, which
provides the ability to theme the command line output (by changing important colors). To activate a
theme, pass a `--theme` option with the name of the theme.

```
yarn beemo babel --theme=one-dark
```

> View the list of available themes on the
> [official Boost repo](https://github.com/milesj/boost/blob/master/src/themes.ts).
