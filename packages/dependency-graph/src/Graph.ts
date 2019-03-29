import Node from './Node';
import { PackageConfig, Tree, TreeNode } from './types';

export default class Graph<T extends PackageConfig = PackageConfig> {
  protected mapped: boolean = false;

  protected nodes: Map<string, Node> = new Map();

  protected packages: Map<string, T> = new Map();

  constructor(packages: T[] = []) {
    this.addPackages(packages);
  }

  /**
   * Add a package by name with an associated `package.json` object.
   * Will map a dependency between the package and its dependees
   * found in `dependencies` and `peerDependencies`.
   */
  addPackage(pkg: T): this {
    if (this.mapped) {
      this.resetNodes();
    }

    // Cache package data for later use
    this.packages.set(pkg.name, pkg);

    // Add node to the graph
    this.addNode(pkg.name);

    return this;
  }

  /**
   * Add multiple packages.
   */
  addPackages(packages: T[] = []): this {
    packages.forEach(pkg => {
      this.addPackage(pkg);
    });

    return this;
  }

  /**
   * Resolve the dependency graph and return a list of all
   * `package.json` objects in the order they are depended on.
   */
  resolveList(): T[] {
    return this.resolveBatchList().reduce((flatList, batchList) => {
      flatList.push(...batchList);

      return flatList;
    }, []);
  }

  /**
   * Resolve the dependency graph and return a tree of nodes for all
   * `package.json` objects and their dependency mappings.
   */
  resolveTree(): Tree<T> {
    this.mapDependencies();

    const seen: Set<string> = new Set();
    const resolve = (node: Node, tree: Tree<T> | TreeNode<T>) => {
      if (seen.has(node.name)) {
        return;
      }

      // Only include nodes that have package data
      const pkg = this.packages.get(node.name);

      if (!pkg) {
        return;
      }

      const branch: TreeNode<T> = {
        package: pkg,
      };

      this.sortByDependedOn(node.dependents).forEach(child => {
        resolve(child, branch);
      });

      if (tree.nodes) {
        tree.nodes.push(branch);
      } else {
        tree.nodes = [branch];
      }

      seen.add(node.name);
    };

    const trunk: Tree<T> = {
      nodes: [],
      root: true,
    };

    this.sortByDependedOn(this.getRootNodes()).forEach(node => resolve(node, trunk));

    // Some nodes are missing, so they must be a cycle
    if (seen.size !== this.nodes.size) {
      this.detectCycle();
    }

    return trunk;
  }

  /**
   * Resolve the dependency graph and return a list of batched
   * `package.json` objects in the order they are depended on.
   */
  resolveBatchList(): T[][] {
    this.mapDependencies();

    const batches: T[][] = [];
    const seen: Set<Node> = new Set();
    const addBatch = () => {
      const nextBatch = Array.from(this.nodes.values()).filter(node => {
        return (
          !seen.has(node) &&
          (node.requirements.size === 0 ||
            Array.from(node.requirements.values()).filter(dep => !seen.has(dep)).length === 0)
        );
      });

      // Some nodes are missing, so they must be a cycle
      if (nextBatch.length === 0) {
        this.detectCycle();
      }

      batches.push(this.sortByDependedOn(nextBatch).map(node => this.packages.get(node.name)!));

      nextBatch.forEach(node => seen.add(node));

      if (seen.size !== this.nodes.size) {
        addBatch();
      }
    };

    addBatch();

    return batches;
  }

  /**
   * Add a node for the defined package name.
   */
  protected addNode(name: string) {
    // Cache node for constant lookups
    this.nodes.set(name, new Node(name));
  }

  /**
   * Dig through all nodes and attempt to find a circular dependency cycle.
   */
  protected detectCycle() {
    const dig = (node: Node, cycle: Set<Node>) => {
      if (cycle.has(node)) {
        const path = [...cycle, node].map(n => n.name).join(' -> ');

        throw new Error(`Circular dependency detected: ${path}`);
      }

      cycle.add(node);

      node.dependents.forEach(child => dig(child, new Set(cycle)));
    };

    this.nodes.forEach(node => dig(node, new Set()));
  }

  /**
   * Return all nodes that can be considered "root",
   * as determined by having no requirements.
   */
  protected getRootNodes(): Node[] {
    const rootNodes: Node[] = [];

    this.nodes.forEach(node => {
      if (node.requirements.size === 0) {
        rootNodes.push(node);
      }
    });

    // If no root nodes are found, but nodes exist, then we have a cycle
    if (rootNodes.length === 0 && this.nodes.size !== 0) {
      this.detectCycle();
    }

    return rootNodes;
  }

  /**
   * Map dependencies between all currently registered packages.
   */
  protected mapDependencies() {
    if (this.mapped) {
      return;
    }

    this.mapped = true;
    this.packages.forEach(pkg => {
      Object.keys({
        ...pkg.dependencies,
        ...pkg.peerDependencies,
      }).forEach(depName => {
        this.mapDependency(pkg.name, depName);
      });
    });
  }

  /**
   * Map a dependency link for a dependent (child) depending on a requirement (parent).
   * Will link the parent and child accordingly, and will remove the child
   * from the root if it exists.
   */
  protected mapDependency(dependentName: string, requirementName: string) {
    const requirement = this.nodes.get(requirementName);
    const dependent = this.nodes.get(dependentName);

    if (!requirement || !dependent) {
      return;
    }

    // Child depends on parent
    dependent.requirements.add(requirement);

    // Parent is a dependee of child
    requirement.dependents.add(dependent);
  }

  /**
   * Remove all current nodes in the graph and add new root nodes for each package.
   */
  protected resetNodes() {
    this.mapped = false;
    this.nodes = new Map();
    this.packages.forEach(pkg => {
      this.addNode(pkg.name);
    });
  }

  /**
   * Sort a set of nodes by most depended on, fall back to alpha sort as tie breaker
   */
  protected sortByDependedOn(nodes: Set<Node> | Node[]): Node[] {
    return [...nodes].sort((a, b) => {
      const diff = b.dependents.size - a.dependents.size;

      if (diff === 0) {
        return a.name > b.name ? 1 : -1;
      }

      return diff;
    });
  }
}
