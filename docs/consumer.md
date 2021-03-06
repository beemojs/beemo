# Consumer setup

Now that you have a configuration module, we can integrate it across all projects. But first, go
ahead and delete all the old config files and dependencies in each project (if they exist), as all
that logic should now be housed in your configuration module.

Once you have a clean slate, install your configuration module, and BOOM, it's as easy as that. No
more development dependency hell, just a single dependency.

```bash
yarn add <config-module> --dev
```

With that being said, create a `.config/beemo.js` file (or `.json`, `.yaml`) in your project root
with a `module` property that matches the name of your configuration module, or another third-party
module (if you don't want to manage your own provider).

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
};
```

### Settings

- `module` (`string`) - Name of your configuration module.
- `configure.cleanup` (`boolean`) - Remove generated config files after execution. Defaults to
  `false`.
- `configure.parallel` (`boolean`) - Create configuration files in parallel. Defaults to `true`.
- `execute.concurrency` (`number`) - Number of builds to run in parallel. Defaults to the number of
  CPUs.
- `execute.graph` (`boolean`) - Prioritize workspace builds based on
  [dependency graph](./workspaces.md#priority-packages).
- `drivers` (`string[] | object`) - Drivers to enable for the consumer.
- `scripts` (`string[] | object`) - Scripts to enable for the consumer.
- `settings` (`object`) - Custom settings specific to your project that can easily be referenced.

> Periods denote nested objects.

## Using drivers

Driver dependencies may have been installed in your configuration module, but that does not make
them available to the current project, as not all drivers will always be necessary. To enable
drivers per project, a `drivers` property must be defined.

This property accepts an array of strings, or objects, with the names of each driver you want to
enable. For example, if we want to use Babel, ESLint, and Jest, we would have the following.

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: ['babel', 'eslint', 'jest'],
};
```

Furthermore, drivers can be configured with options by using an object. If a driver does not require
options, either pass an empty object, or a boolean `true`.

```js
// .config/beemo.js
module.exports = {
  module: '@<username>/dev-tools',
  drivers: {
    babel: true,
    eslint: {
      args: ['--color', '--report-unused-disable-directives'],
    },
    jest: {
      env: { NODE_ENV: 'test' },
    },
  },
};
```

Options can also be set through the [bootstrap and event system](./events.md).

### Options

- `args` (`string[]`) - Arguments to always pass when executing the driver binary.
- `dependencies` (`string[]`) - Other drivers that are required for this driver to run.
- `env` (`object`) - Environment variables to pass when executing the driver binary with
  [execa](https://github.com/sindresorhus/execa).
- `expandGlobs` (`boolean`) - Controls whether or not glob patterns in args are automatically
  expanded before being passed to the driver binary. Defaults to `true`.
- `strategy` (`create | copy | reference | template | native | none`) - Type of
  [strategy](./driver.md#config-strategies) to use when generating a config file. Default is
  different per driver.
- `template` (`string`) - File path to a template function for generating custom config files and
  paths. Is required when `strategy` is "template".

## Executing drivers

Now for the fun part, executing the driver! It's as simple as `yarn beemo <driver>` (or
`npx beemo <driver>`). Once entered, this will initialize Beemo's pipeline, generate a configuration
file, execute the underlying driver binary, handle stdout and stderr output, cleanup after itself,
and lastly, leave a beautiful message in your console.

> All arguments passed to Beemo are passed to the driver's underlying binary.

That being said, consistently remembering the correct commands and arguments to pass to `yarn` and
`npx` is tedious. So why not use scripts? Feel free to steal the following.

```json
{
  "scripts": {
    "build": "beemo babel ./src --out-dir ./lib",
    "lint": "beemo eslint ./src ./tests",
    "test": "beemo jest",
    "format": "beemo prettier --write \"./{src,tests}/**/*.{js,json,md}\"",
    "type": "beemo typescript"
  }
}
```

### CLI options

The following options are available when executing a driver.

- `--concurrency` (`number`) - Number of builds to run in parallel. Defaults to the amount of CPUs.
- `--[no-]graph` (`bool`) - Prioritize workspace builds based on
  [dependency graph](./workspaces.md#priority-packages).
- `--stdio` (`buffer | inherit | stream`) - Control how the underlying driver output is displayed in
  the console. Defaults to "buffer".
  - `buffer` - Renders Beemo output using the defined reporter(s). Underlying driver output will be
    rendered on success or failure.
  - `inherit` - Doesn't render Beemo output and instead streams the underlying driver output live.
  - `stream` - A combination of `buffer` and `inherit`.
- `--workspaces` (`string`) - Execute the command in each [workspace](./workspaces.md) defined by
  the pattern/value. Pass `*` to run in all workspaces.

### Watch mode

If the underlying driver supports file watching, most commonly through a CLI option like `-w` or
`--watch`, Beemo will attempt to capture and pipe this output to your terminal.

### Live mode

The Beemo console masks output of the underlying driver while it is executing. If you prefer to see
the driver output live, simply pass `--stdio=stream` or `--stdio=inherit`.

## Executing scripts

A script within your configuration module can be executed using `yarn beemo run-script <name>` (or
`npx beemo run-script <name>`). The name of the script should be passed in kebab-case.

> All arguments passed to Beemo are passed to the script's `run()` method.

## Creating config files

Executing a driver will dynamically create a configuration file at runtime. If you'd like to create
the config manually outside of executing a driver, you can use the `yarn beemo create-config` (or
`npx beemo create-config`).

When no arguments are passed, it will create a config file for all enabled drivers (found in the
`drivers` setting). Otherwise, a config file will be created for each driver name passed as an
argument.

```bash
// All drivers
yarn beemo create-config

// Only Babel and Jest
yarn beemo create-config babel jest
```

> If a driver has a dependency on another driver, it will create a config file for the dependency as
> well.

## Overriding configs

Your configuration module may now house and provide all configurations, but that doesn't mean it's
applicable to _all_ consuming projects. To accomodate this, Beemo supports overriding of driver
config on a project-by-project basis through a local `.config/beemo/<driver>.(js|ts)` file.

```js
// .config/beemo/eslint.js
module.exports = {
  rules: {
    'no-param-reassign': 0,
  },
};
```

> Some dev tools support `package.json` overrides like this, but it's preferred to use the Beemo
> approach for interoperability.

## Custom configs with templates

Beemo provides sane defaults for all official drivers and attempts to standardize the configuration
process as much as possible. However, it's not perfect, and may not work for all consumers. To
mitigate this problem, each driver supports a template based strategy, in which a custom template
function can be used to handle the config generation (custom merging, etc), and the destination file
path.

To use templates, set the driver `strategy` option to "template", and the `template` option to a
file path for the template function (relative to the `.config` folder).

```js
// .config/beemo.js
module.exports = {
  module: '<config-module>',
  drivers: [
    [
      'eslint',
      {
        strategy: 'template',
        template: './path/to/custom/template.ts',
      },
    ],
  ],
};
```

The template is merely a function that receives a list of config objects from multiple sources, and
must return a single config object (or string), and an optional destination path. It also receives
an options object with helpful information about the current process.

To demonstrate the power of templates, let's write a custom template that generates a YAML
configuration file for ESLint.

```ts
import { yaml } from '@boost/common';
import { ConfigObject, ConfigTemplateResult, ConfigTemplateOptions } from '@beemo/core';

export default function customTemplate(
  configs: ConfigObject[],
  options: ConfigTemplateOptions,
): ConfigTemplateResult {
  // Manually merge the list of configs into a single config object
  // using the rules of the driver, or ones unique to your project.
  const config = mergeConfigs(configs);

  // A template must return a `config` property, which can be an object
  // that will be formatted as JSON/JS, or a string which will be written as-is.
  // It can also return an optional `path` property, allowing the destination
  // config file path to be customized.
  return {
    config: yaml.stringify(config),
    path: options.context.cwd.append('.eslintrc.yaml'),
  };
}
```

The list of available options are:

- `configModule` (`string`) - Name of the configuration module.
- `consumerConfigPath` (`Path | null`) - Path to the driver's config file in the configuration
  module. For example, `configs/eslint.ts`. Is `null` if not found.
- `context` (`Context`) - Current pipeline context.
- `driver` (`Driver`) - Current instance for the driver being processed.
- `driverConfigPath` (`Path`) - Path to the driver's default config file destination. For example,
  `.eslintrc.js` in the root.
- `driverName` (`string`) - Name of the driver being processed. For example, `eslint`.
- `providerConfigPath` (`Path | null`) - Path to the driver's config file in the current project.
  For example, `.config/beemo/eslint.ts`. Is `null` if not found.
- `templatePath` (`Path`) - Path to the template file (itself).
- `tool` (`Tool`) - Current [tool instance](./tool.md).
