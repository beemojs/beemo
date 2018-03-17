# Tool Instance

A Beemo Tool instance is a representation of the current running process. It provides loaded
configuration, utility methods, and more.

## Configuration

The loaded consumer configuration can be found under the `config` property. This is usually the
"beemo" block in `package.json`.

```js
tool.config.module; // @<username>/build-tool-config
```

While the `package` property is the loaded consumer `package.json`.

```js
tool.package.name;
```

## Logging

Standard messages can be logged with `log(message)` and will be displayed on success (stdout), while
error messages can be logged `logError(message)` and will be displayed on failure (stderr).

```js
tool.log('Something happened!');
```

Debug messages that will only be displayed during `--debug` can be logged with `debug(message)`.
Furthermore, `invariant(condition, message, pass, fail)` can be used to conditionally log successful
and failure debug messages.

```js
tool.invariant(loaded, 'Has it loaded?', 'Yes', 'No');
```

## Events

Event listeners can be registered and unregistered with `on(event, listener)` and
`off(event, listener)` respectively. Furthermore, all listeners will receive an `Event` instance as
their 1st argument, which can be used to stop propagation and pass data between listeners.

```js
tool.on('init', event => {
  event.value = data;
  event.stop();
});
```

> Event stopping should be used carefully.
