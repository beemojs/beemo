# Beemo

Manage build tools, their configuration, and commands in a single centralized repository. Beemo aims
to solve the multi-project maintenance fatigue by removing the following burdens across all
projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, continuous copy and paste, and more.

### Features

* Manage build tools and configurations in a single repository.
* Configure supported build tools using `.js` files.
* Customize and alter config at runtime with CLI options.
* Pass custom CLI options to build tool commands without failure.
* Automatically expand glob patterns (a better alternative to bash).
* Listen to and act upon events.
* Easily share config between build tools.
* Avoid relative config or `extend` paths.
* Automatic config file cleanup.
* Custom scripts with CLI options.
* Dotfile synchronization.
* Workspaces (monorepo) support.
* And much more.

## Requirements

* Node 8+
* GitHub, Bitbucket, or another VCS

## Example

Quick example of running Jest. Beemo will automatically generate `jest.config.js` and `.babelrc`
files at runtime before executing the underlying command.

![Beemo](https://raw.githubusercontent.com/milesj/beemo/master/docs/beemo.gif)
