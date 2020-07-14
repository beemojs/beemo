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

> Messages (excluding invariant) are formatted with
> [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) and can interpolate
> variables.
