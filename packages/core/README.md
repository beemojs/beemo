# 🤖 Beemo [ALPHA]

[![Build Status](https://travis-ci.org/milesj/beemo.svg?branch=master)](https://travis-ci.org/milesj/beemo)

Manage dev and build tools, their configuration, and commands in a single centralized repository.
Beemo aims to solve the multi-project maintenance fatigue by removing the following burdens across
all projects: config and dotfile management, multiple config patterns, up-to-date development
dependencies, continuous copy and paste, and more.

### Features

- Manage dev tools and configurations in a single repository.
- Configure supported dev tools using `.js` files.
- Customize and alter config at runtime with CLI options.
- Pass custom CLI options to dev tool commands without failure.
- Automatically expand glob patterns (a better alternative to bash).
- Listen to and act upon events.
- Easily share config between dev tools.
- Avoid relative config or `extend` paths.
- Automatic config file cleanup.
- Custom scripts with CLI options.
- Dotfile synchronization.
- Workspaces (monorepo) support.
- Parallel, pooled, and prioritized builds.
- And much more.

## Requirements

- Node 8+
- GitHub, Bitbucket, or another VCS

## Documentation

[https://milesj.gitbook.io/beemo](https://milesj.gitbook.io/beemo)
