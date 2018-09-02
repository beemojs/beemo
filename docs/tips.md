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
glob multiple filesystem paths, but this isn't entirely efficient, as Bash only supports a subset of
the RE specification, nor does it support wildcards like `**` (recursive search).

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

Multiple commands for the same driver can be run in parallel by passing one or many `--parallel`
options. Each option must define a value, that is double quoted, with additional flags and options
to pass.

For example, if you'd like to run separate ESLint commands in different folders.

```
yarn beemo eslint --color --parallel="./src --ext=.ts,.tsx" --parallel="./tests --report-unused-disable-directives"

// Would run 2 commands in parallel
eslint --color ./src --ext=.ts,.tsx
eslint --color ./tests --report-unused-disable-directives
```

That being said, this feature has a few critical caveats to work correctly.

- Option values must be double quoted! Otherwise the argument parser will parse options in the wrong
  or unintended order.
- Option values may not contain nested quoted option values. Unintended side-effects may occur.
- Nested option values may not contain spaces.

```
// Invalid
--parallel=unquoted
--parallel="--foo="value""
--parallel="--foo='value'"
--parallel="--foo=some value"

// Valid
--parallel="quoted"
--parallel="--foo=value"
```

> Parallel defined arguments are not accessible within the configuration file, as the file has
> already been created using the initially passed non-parallel arguments. However, depending on the
> driver, some argument may be available under `process.beemo.context.args`.

## Custom Executable & Config Name

The Beemo command line executable can be renamed to offer a better and more immersive branding
experience, especially when used at a large company. To start, create a new executable in your
configuration module at `bin/<name>.js`, with the following contents (which simply runs Beemo's
console).

```
#!/usr/bin/env node

require('@beemo/cli/lib/CLI');
```

> Define a `BEEMO_MANUAL_URL` environment variable to change the manual URL in the help output.

Be sure to reference your new executable in your configuration module's `package.json`.

```json
{
  "bin": {
    "<name>": "./bin/<name>.js"
  }
}
```

And to configure the consumer with the new name as well.

```json
{
  "<name>": {
    "module": "@<username>/build-tool-config"
  }
}
```

## Output Verbosity

Console output can be controlled with the `--level` option and a numerical value between 1 and 3
(default). More information is logged the higher the range. To hide all output, use `--silent`
instead.

## CLI Themes

Beemo is built on [Boost](https://github.com/milesj/boost), a powerful build tool framework, which
provides the ability to theme the command line output (by changing important colors). To activate a
theme, pass a `--theme` option with the name of the theme.

```
yarn beemo babel --theme=one-dark
```

> View the list of available themes on the
> [official Boost repo](https://github.com/milesj/boost/blob/master/src/themes.ts).
