import path from 'path';
import glob from 'fast-glob';
import Graph from '../src/Graph';
import { PackageConfig } from '../src/types';

function getBeemoPackages() {
  const pkgs: { [key: string]: PackageConfig } = {};

  glob.sync(path.join(__dirname, '../../*/package.json')).forEach(pkgPath => {
    // eslint-disable-next-line
    const pkg = require(String(pkgPath));
    pkgs[pkg.name] = pkg;
  });

  return pkgs;
}

describe('Graph', () => {
  it('graphs Beemo dependencies correctly ', () => {
    const pkgs = getBeemoPackages();
    const graph = new Graph(Object.values(pkgs));

    expect(graph.resolveInOrder()).toEqual([
      pkgs['@beemo/core'],
      pkgs['@beemo/dependency-graph'],
      pkgs['@beemo/cli'],
      pkgs['@beemo/driver-babel'],
      pkgs['@beemo/driver-eslint'],
      pkgs['@beemo/driver-flow'],
      pkgs['@beemo/driver-jest'],
      pkgs['@beemo/driver-mocha'],
      pkgs['@beemo/driver-prettier'],
      pkgs['@beemo/driver-typescript'],
      pkgs['@beemo/driver-webpack'],
    ]);

    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: pkgs['@beemo/core'],
          nodes: [
            {
              leaf: true,
              package: pkgs['@beemo/cli'],
            },
            {
              package: pkgs['@beemo/driver-babel'],
              nodes: [
                {
                  leaf: true,
                  package: pkgs['@beemo/driver-jest'],
                },
              ],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-eslint'],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-flow'],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-mocha'],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-prettier'],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-typescript'],
            },
            {
              leaf: true,
              package: pkgs['@beemo/driver-webpack'],
            },
          ],
        },
        {
          leaf: true,
          package: pkgs['@beemo/dependency-graph'],
        },
      ],
    });
  });

  it.skip('handles circular cycles', () => {
    const graph = new Graph([
      { name: 'foo', dependencies: { bar: '0.0.0' } },
      { name: 'bar', dependencies: { foo: '0.0.0' } },
    ]);

    console.log(graph);

    expect(graph.resolveInOrder()).toEqual([]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [],
    });
  });

  it('returns an empty array when no packages are defined', () => {
    const graph = new Graph();

    expect(graph.resolveInOrder()).toEqual([]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [],
    });
  });

  it('places all nodes at the root if they do not relate to each other', () => {
    const graph = new Graph([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    expect(graph.resolveInOrder()).toEqual([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          leaf: true,
          package: { name: 'foo' },
        },
        {
          leaf: true,
          package: { name: 'bar' },
        },
        {
          leaf: true,
          package: { name: 'baz' },
        },
      ],
    });
  });

  it('maps dependencies between 2 packages', () => {
    const graph = new Graph([{ name: 'foo' }, { name: 'bar', dependencies: { foo: '0.0.0' } }]);

    expect(graph.resolveInOrder()).toEqual([
      { name: 'foo' },
      { name: 'bar', dependencies: { foo: '0.0.0' } },
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'foo' },
          nodes: [
            {
              leaf: true,
              package: { name: 'bar', dependencies: { foo: '0.0.0' } },
            },
          ],
        },
      ],
    });
  });

  it('maps dependencies between 2 packages (reverse order + peer deps)', () => {
    const graph = new Graph([{ name: 'foo', peerDependencies: { bar: '0.0.0' } }, { name: 'bar' }]);

    expect(graph.resolveInOrder()).toEqual([
      { name: 'bar' },
      { name: 'foo', peerDependencies: { bar: '0.0.0' } },
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'bar' },
          nodes: [
            {
              leaf: true,
              package: { name: 'foo', peerDependencies: { bar: '0.0.0' } },
            },
          ],
        },
      ],
    });
  });

  it('maps dependencies between 3 packages', () => {
    const graph = new Graph([
      { name: 'foo', dependencies: { baz: '0.0.0' } },
      { name: 'bar' },
      { name: 'baz' },
    ]);

    expect(graph.resolveInOrder()).toEqual([
      { name: 'bar' },
      { name: 'baz' },
      { name: 'foo', dependencies: { baz: '0.0.0' } },
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          leaf: true,
          package: { name: 'bar' },
        },
        {
          package: { name: 'baz' },
          nodes: [
            {
              leaf: true,
              package: { name: 'foo', dependencies: { baz: '0.0.0' } },
            },
          ],
        },
      ],
    });
  });

  it('maps 3 layers deep', () => {
    const graph = new Graph([
      { name: 'foo', dependencies: { bar: '0.0.0' } },
      { name: 'bar', dependencies: { baz: '0.0.0' } },
      { name: 'baz' },
    ]);

    expect(graph.resolveInOrder()).toEqual([
      { name: 'baz' },
      { name: 'bar', dependencies: { baz: '0.0.0' } },
      { name: 'foo', dependencies: { bar: '0.0.0' } },
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'baz' },
          nodes: [
            {
              package: { name: 'bar', dependencies: { baz: '0.0.0' } },
              nodes: [{ leaf: true, package: { name: 'foo', dependencies: { bar: '0.0.0' } } }],
            },
          ],
        },
      ],
    });
  });

  it('resets the graph when a package is added after resolution', () => {
    const graph = new Graph([{ name: 'foo' }, { name: 'bar' }]);

    expect(graph.resolveInOrder()).toEqual([{ name: 'foo' }, { name: 'bar' }]);

    graph.addPackage({ name: 'qux', dependencies: { baz: '0.0.0' } });
    graph.addPackage({ name: 'baz', dependencies: { foo: '0.0.0' } });

    expect(graph.resolveInOrder()).toEqual([
      { name: 'foo' },
      { name: 'bar' },
      { name: 'baz', dependencies: { foo: '0.0.0' } },
      { name: 'qux', dependencies: { baz: '0.0.0' } },
    ]);
  });
});
