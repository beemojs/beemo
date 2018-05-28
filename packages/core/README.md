# 🤖 Beemo [ALPHA]

[![Build Status](https://travis-ci.org/milesj/beemo.svg?branch=master)](https://travis-ci.org/milesj/beemo)

Manage build tools, their configuration, and commands in a single centralized repository. Beemo aims
to solve the multi-project maintenance fatigue by removing the following burdens across all
projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, continuous copy and paste, and more.

### Features

- Manage build tools and configurations in a single repository.
- Configure supported build tools using `.js` files.
- Customize and alter config at runtime with CLI options.
- Pass custom CLI options to build tool commands without failure.
- Automatically expand glob patterns (a better alternative to bash).
- Easily share config between build tools.
- Avoid relative config or `extend` paths.
- Automatic config file cleanup.
- Custom scripts with CLI options.
- Dotfile synchronization.
- And much more.

## Requirements

- Node 6.5+
- GitHub, Bitbucket, or another VCS

## Documentation

[https://milesj.gitbooks.io/beemo](https://milesj.gitbooks.io/beemo)
