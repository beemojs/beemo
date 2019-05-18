# Tool Instance

A Beemo Tool instance is a representation of the current running process. It provides loaded
configuration, utility methods, and more.

## Configuration

The loaded consumer configuration can be found under the `config` property. This is usually the
"beemo" block in `package.json`.

```js
tool.config.module; // @<username>/dev-tools
```

While the `package` property is the loaded consumer `package.json`.

```js
tool.package.name;
```

## Logging

Standard messages can be logged with `log(message)` and will be displayed on success (stdout), while
error messages can be logged `log.error(message)` and will be displayed on failure (stderr).

// TODO link to docs

```js
tool.log('Something happened!');
tool.log.error('Oops, something is broken!');
```

Debug messages that will only be displayed during `--debug` can be logged with
`debug(message, ...params)`. Furthermore, `debug.invariant(condition, message, pass, fail)` can be
used to conditionally log successful and failure debug messages.

```js
tool.debug(var);
tool.debug.invariant(loaded, 'Has it loaded?', 'Yes', 'No');
```

> Messages (excluding invariant) are formatted with
> [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) and can interpolate
> variables.
