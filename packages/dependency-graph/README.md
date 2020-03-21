# Dependency Graph

[![Build Status](https://github.com/beemojs/beemo/workflows/Build/badge.svg)](https://github.com/beemojs/beemo/actions?query=branch%3Amaster)
[![npm version](https://badge.fury.io/js/%40beemo%2Fdependency-graph.svg)](https://www.npmjs.com/package/@beemo/dependency-graph)
[![npm deps](https://david-dm.org/beemojs/beemo.svg?path=packages/dependency-graph)](https://www.npmjs.com/package/@beemo/dependency-graph)

Generate a dependency graph for a list of packages, based on their defined `dependencies` and
`peerDependencies`.

## Installation

```
yarn add @beemo/dependency-graph
// Or
npm install @beemo/dependency-graph --save
```

## Documentation

To begin, instantiate an instance of `Graph`, which accepts a list of optional `package.json`
objects as the first argument.

```ts
import Graph from '@beemo/dependency-graph';

const graph = new Graph([
  {
    name: '@beemo/core',
  },
  {
    name: '@beemo/cli',
    dependencies: {
      '@beemo/core': '^1.0.0',
    },
  },
]);
```

Alternatively, `package.json` objects can be added dynamically using `Graph#addPackage` or
`Graph#addPackages`.

```ts
graph.addPackage({
  name: '@beemo/driver-jest',
  peerDependencies: {
    '@beemo/core': '^1.0.0',
    '@beemo/driver-babel': '^1.0.0',
  },
});
```

Once all packages have been defined, we can generate a graph using these `Graph` methods:

- `resolveList` - Returns an array of packages in order of most depended on.
- `resolveBatchList` - Like the previous, but returns the array batched based on depth.
- `resolveTree` - Returns a tree of nodes based on the graph.

```ts
// List of packages
graph.resolveList().forEach((pkg) => {
  console.log(pkg.name);
});

// List of list of packages
graph.resolveBatchList().forEach((pkgs) => {
  pkgs.forEach((pkg) => {
    console.log(pkg.name);
  });
});

// Tree of nodes
graph.resolveTree().nodes.forEach((node) => {
  console.log(node.package.name);

  if (node.nodes) {
    // Dependents
  }
});
```

> Will only resolve and return packages that have been defined. Will _not_ return non-defined
> packages found in `dependencies` and `peerDependencies`.
