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

    expect(graph.resolveList()).toEqual([
      pkgs['@beemo/dependency-graph'],
      pkgs['@beemo/core'],
      pkgs['@beemo/driver-babel'],
      pkgs['@beemo/cli'],
      pkgs['@beemo/driver-eslint'],
      pkgs['@beemo/driver-flow'],
      pkgs['@beemo/driver-mocha'],
      pkgs['@beemo/driver-prettier'],
      pkgs['@beemo/driver-typescript'],
      pkgs['@beemo/driver-webpack'],
      pkgs['@beemo/driver-jest'],
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [pkgs['@beemo/dependency-graph']],
      [pkgs['@beemo/core']],
      [
        pkgs['@beemo/driver-babel'],
        pkgs['@beemo/cli'],
        pkgs['@beemo/driver-eslint'],
        pkgs['@beemo/driver-flow'],
        pkgs['@beemo/driver-mocha'],
        pkgs['@beemo/driver-prettier'],
        pkgs['@beemo/driver-typescript'],
        pkgs['@beemo/driver-webpack'],
      ],
      [pkgs['@beemo/driver-jest']],
    ]);

    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: pkgs['@beemo/dependency-graph'],
          nodes: [
            {
              package: pkgs['@beemo/core'],
              nodes: [
                {
                  package: pkgs['@beemo/driver-babel'],
                  nodes: [
                    {
                      package: pkgs['@beemo/driver-jest'],
                    },
                  ],
                },
                {
                  package: pkgs['@beemo/cli'],
                },
                {
                  package: pkgs['@beemo/driver-eslint'],
                },
                {
                  package: pkgs['@beemo/driver-flow'],
                },
                {
                  package: pkgs['@beemo/driver-mocha'],
                },
                {
                  package: pkgs['@beemo/driver-prettier'],
                },
                {
                  package: pkgs['@beemo/driver-typescript'],
                },
                {
                  package: pkgs['@beemo/driver-webpack'],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('returns an empty array when no packages are defined', () => {
    const graph = new Graph();

    expect(graph.resolveList()).toEqual([]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [],
    });
  });

  it('places all nodes at the root if they do not relate to each other', () => {
    const graph = new Graph([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);

    expect(graph.resolveList()).toEqual([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
    expect(graph.resolveBatchList()).toEqual([[{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'foo' },
        },
        {
          package: { name: 'bar' },
        },
        {
          package: { name: 'baz' },
        },
      ],
    });
  });

  it('maps dependencies between 2 packages', () => {
    const graph = new Graph([{ name: 'foo' }, { name: 'bar', dependencies: { foo: '0.0.0' } }]);

    expect(graph.resolveList()).toEqual([
      { name: 'foo' },
      { name: 'bar', dependencies: { foo: '0.0.0' } },
    ]);
    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'foo' }],
      [{ name: 'bar', dependencies: { foo: '0.0.0' } }],
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'foo' },
          nodes: [
            {
              package: { name: 'bar', dependencies: { foo: '0.0.0' } },
            },
          ],
        },
      ],
    });
  });

  it('maps dependencies between 2 packages (reverse order + peer deps)', () => {
    const graph = new Graph([{ name: 'foo', peerDependencies: { bar: '0.0.0' } }, { name: 'bar' }]);

    expect(graph.resolveList()).toEqual([
      { name: 'bar' },
      { name: 'foo', peerDependencies: { bar: '0.0.0' } },
    ]);
    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'bar' }],
      [{ name: 'foo', peerDependencies: { bar: '0.0.0' } }],
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'bar' },
          nodes: [
            {
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

    expect(graph.resolveList()).toEqual([
      { name: 'baz' },
      { name: 'bar' },
      { name: 'foo', dependencies: { baz: '0.0.0' } },
    ]);
    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'baz' }, { name: 'bar' }],
      [{ name: 'foo', dependencies: { baz: '0.0.0' } }],
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'baz' },
          nodes: [
            {
              package: { name: 'foo', dependencies: { baz: '0.0.0' } },
            },
          ],
        },
        {
          package: { name: 'bar' },
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

    expect(graph.resolveList()).toEqual([
      { name: 'baz' },
      { name: 'bar', dependencies: { baz: '0.0.0' } },
      { name: 'foo', dependencies: { bar: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'baz' }],
      [{ name: 'bar', dependencies: { baz: '0.0.0' } }],
      [{ name: 'foo', dependencies: { bar: '0.0.0' } }],
    ]);

    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'baz' },
          nodes: [
            {
              package: { name: 'bar', dependencies: { baz: '0.0.0' } },
              nodes: [{ package: { name: 'foo', dependencies: { bar: '0.0.0' } } }],
            },
          ],
        },
      ],
    });
  });

  it('package with 2 dependencies', () => {
    const graph = new Graph([
      { name: 'foo' },
      { name: 'bar', dependencies: { foo: '0.0.0' } },
      { name: 'baz', dependencies: { foo: '0.0.0' } },
    ]);

    expect(graph.resolveList()).toEqual([
      { name: 'foo' },
      { name: 'bar', dependencies: { foo: '0.0.0' } },
      { name: 'baz', dependencies: { foo: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'foo' }],
      [
        { name: 'bar', dependencies: { foo: '0.0.0' } },
        { name: 'baz', dependencies: { foo: '0.0.0' } },
      ],
    ]);
  });

  it('sorts each depth by most dependend on', () => {
    const graph = new Graph([
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
      { name: 'd', dependencies: { b: '0.0.0' } },
      { name: 'e', dependencies: { i: '0.0.0' } },
      { name: 'f', peerDependencies: { b: '0.0.0' } },
      { name: 'g', dependencies: { a: '0.0.0' } },
      { name: 'h', dependencies: { b: '0.0.0' } },
      { name: 'i', dependencies: { k: '0.0.0' } },
      { name: 'j', peerDependencies: { c: '0.0.0' } },
      { name: 'k', dependencies: { f: '0.0.0' } },
    ]);

    expect(graph.resolveList()).toEqual([
      { name: 'b' },
      { name: 'a' },
      { name: 'c' },
      { name: 'f', peerDependencies: { b: '0.0.0' } },
      { name: 'd', dependencies: { b: '0.0.0' } },
      { name: 'g', dependencies: { a: '0.0.0' } },
      { name: 'h', dependencies: { b: '0.0.0' } },
      { name: 'j', peerDependencies: { c: '0.0.0' } },
      { name: 'k', dependencies: { f: '0.0.0' } },
      { name: 'i', dependencies: { k: '0.0.0' } },
      { name: 'e', dependencies: { i: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'b' }, { name: 'a' }, { name: 'c' }],
      [
        { name: 'f', peerDependencies: { b: '0.0.0' } },
        { name: 'd', dependencies: { b: '0.0.0' } },
        { name: 'g', dependencies: { a: '0.0.0' } },
        { name: 'h', dependencies: { b: '0.0.0' } },
        { name: 'j', peerDependencies: { c: '0.0.0' } },
      ],
      [{ name: 'k', dependencies: { f: '0.0.0' } }],
      [{ name: 'i', dependencies: { k: '0.0.0' } }],
      [{ name: 'e', dependencies: { i: '0.0.0' } }],
    ]);
    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'b' },
          nodes: [
            {
              package: { name: 'f', peerDependencies: { b: '0.0.0' } },
              nodes: [
                {
                  package: { name: 'k', dependencies: { f: '0.0.0' } },
                  nodes: [
                    {
                      package: { name: 'i', dependencies: { k: '0.0.0' } },
                      nodes: [
                        {
                          package: { name: 'e', dependencies: { i: '0.0.0' } },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              package: { name: 'd', dependencies: { b: '0.0.0' } },
            },
            {
              package: { name: 'h', dependencies: { b: '0.0.0' } },
            },
          ],
        },
        {
          package: { name: 'a' },
          nodes: [
            {
              package: { name: 'g', dependencies: { a: '0.0.0' } },
            },
          ],
        },
        {
          package: { name: 'c' },
          nodes: [
            {
              package: { name: 'j', peerDependencies: { c: '0.0.0' } },
            },
          ],
        },
      ],
    });
  });

  it('orders correctly regardless of folder alpha sorting', () => {
    const graph = new Graph([
      { name: 'core', dependencies: { icons: '0.0.0' } },
      { name: 'icons' },
      { name: 'helpers', dependencies: { core: '0.0.0', utils: '0.0.0' } },
      { name: 'forms', dependencies: { core: '0.0.0' } },
      { name: 'utils', dependencies: { core: '0.0.0' } },
    ]);

    expect(graph.resolveList()).toEqual([
      { name: 'icons' },
      { name: 'core', dependencies: { icons: '0.0.0' } },
      { name: 'utils', dependencies: { core: '0.0.0' } },
      { name: 'forms', dependencies: { core: '0.0.0' } },
      { name: 'helpers', dependencies: { core: '0.0.0', utils: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'icons' }],
      [{ name: 'core', dependencies: { icons: '0.0.0' } }],
      [
        { name: 'utils', dependencies: { core: '0.0.0' } },
        { name: 'forms', dependencies: { core: '0.0.0' } },
      ],
      [{ name: 'helpers', dependencies: { core: '0.0.0', utils: '0.0.0' } }],
    ]);

    expect(graph.resolveTree()).toEqual({
      root: true,
      nodes: [
        {
          package: { name: 'icons' },
          nodes: [
            {
              package: { name: 'core', dependencies: { icons: '0.0.0' } },
              nodes: [
                {
                  package: { name: 'utils', dependencies: { core: '0.0.0' } },
                  nodes: [
                    {
                      package: { name: 'helpers', dependencies: { core: '0.0.0', utils: '0.0.0' } },
                    },
                  ],
                },
                {
                  package: { name: 'forms', dependencies: { core: '0.0.0' } },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('orders correctly with complex dependencies', () => {
    const graph = new Graph([
      { name: 'stats', dependencies: {} },
      { name: 'service-client', dependencies: { stats: '0.0.0', 'http-client': '0.0.0' } },
      { name: 'auth-client', dependencies: { stats: '0.0.0', 'http-client': '0.0.0' } },
      { name: 'config', dependencies: {} },
      { name: 'feature-flags', dependencies: { config: '0.0.0' } },
      {
        name: 'framework',
        dependencies: { stats: '0.0.0', 'auth-client': '0.0.0', 'feature-flags': '0.0.0' },
      },
      { name: 'http-client', dependencies: { stats: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'stats', dependencies: {} }, { name: 'config', dependencies: {} }],
      [
        { name: 'http-client', dependencies: { stats: '0.0.0' } },
        { name: 'feature-flags', dependencies: { config: '0.0.0' } },
      ],
      [
        { name: 'auth-client', dependencies: { stats: '0.0.0', 'http-client': '0.0.0' } },
        { name: 'service-client', dependencies: { stats: '0.0.0', 'http-client': '0.0.0' } },
      ],
      [
        {
          name: 'framework',
          dependencies: { stats: '0.0.0', 'auth-client': '0.0.0', 'feature-flags': '0.0.0' },
        },
      ],
    ]);
  });

  it('resets the graph when a package is added after resolution', () => {
    const graph = new Graph<PackageConfig>([{ name: 'foo' }, { name: 'bar' }]);

    expect(graph.resolveList()).toEqual([{ name: 'foo' }, { name: 'bar' }]);

    graph.addPackage({ name: 'qux', dependencies: { baz: '0.0.0' } });
    graph.addPackage({ name: 'baz', dependencies: { foo: '0.0.0' } });

    expect(graph.resolveList()).toEqual([
      { name: 'foo' },
      { name: 'bar' },
      { name: 'baz', dependencies: { foo: '0.0.0' } },
      { name: 'qux', dependencies: { baz: '0.0.0' } },
    ]);

    expect(graph.resolveBatchList()).toEqual([
      [{ name: 'foo' }, { name: 'bar' }],
      [{ name: 'baz', dependencies: { foo: '0.0.0' } }],
      [{ name: 'qux', dependencies: { baz: '0.0.0' } }],
    ]);
  });

  describe('circular', () => {
    describe('list', () => {
      it('errors when no root nodes found', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { baz: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz', dependencies: { bar: '0.0.0' } },
        ]);

        expect(() => {
          graph.resolveList();
        }).toThrowError('Circular dependency detected: foo -> bar -> baz -> foo');
      });

      it('errors when only some of the deps are a cycle', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { bar: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz' },
        ]);

        expect(() => {
          graph.resolveList();
        }).toThrowError('Circular dependency detected: foo -> bar -> foo');
      });
    });

    describe('tree', () => {
      it('errors when no root nodes found', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { baz: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz', dependencies: { bar: '0.0.0' } },
        ]);

        expect(() => {
          graph.resolveTree();
        }).toThrowError('Circular dependency detected: foo -> bar -> baz -> foo');
      });

      it('errors when only some of the deps are a cycle', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { bar: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz' },
        ]);

        expect(() => {
          graph.resolveTree();
        }).toThrowError('Circular dependency detected: foo -> bar -> foo');
      });
    });

    describe('batchList', () => {
      it('errors when no root nodes found', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { baz: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz', dependencies: { bar: '0.0.0' } },
        ]);

        expect(() => {
          graph.resolveBatchList();
        }).toThrowError('Circular dependency detected: foo -> bar -> baz -> foo');
      });

      it('errors when only some of the deps are a cycle', () => {
        const graph = new Graph([
          { name: 'foo', dependencies: { bar: '0.0.0' } },
          { name: 'bar', dependencies: { foo: '0.0.0' } },
          { name: 'baz' },
        ]);

        expect(() => {
          graph.resolveBatchList();
        }).toThrowError('Circular dependency detected: foo -> bar -> foo');
      });
    });
  });
});
