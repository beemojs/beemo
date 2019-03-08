import Node from './Node';
import { PackageConfig, Tree, TreeNode } from './types';

export default class Graph<T extends PackageConfig = PackageConfig> {
  protected mapped: boolean = false;

  protected nodes: Map<string, Node> = new Map();

  protected packages: Map<string, T> = new Map();

  protected root: Set<Node> = new Set();

  constructor(packages: T[] = []) {
    packages.forEach(pkg => {
      this.addPackage(pkg);
    });
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
   * Resolve the dependency graph and return an array of all package configs
   * in the order they are depended on.
   */
  resolveInOrder(): T[] {
    this.mapDependencies();

    const order: Set<T> = new Set();
    const queue: Node[] = this.sortByDependedOn(this.root);

    while (queue.length > 0) {
      const node = queue.shift();

      if (!node) {
        break;
      }

      const pkg = this.packages.get(node.name);

      // Only include nodes that have package data
      if (pkg) {
        order.add(pkg);
      }

      // Add children after parents so order is preserved
      queue.push(...this.sortByDependedOn(node.dependents));
    }

    return Array.from(order);
  }

  /**
   * Resolve the dependency graph and return a tree or nodes for all
   * package configs and their dependency mappings.
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

    this.sortByDependedOn(this.root).forEach(node => resolve(node, trunk));

    return trunk;
  }

  /**
   * Add a node for the defined package name.
   */
  protected addNode(name: string) {
    const node = new Node(name);

    // Cache node for constant lookups
    this.nodes.set(name, node);

    // Add to the root as it has no parent yet
    this.root.add(node);
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

    // Remove from the root
    this.root.delete(dependent);
  }

  /**
   * Remove all current nodes in the graph and add new root nodes for each package.
   */
  protected resetNodes() {
    this.mapped = false;
    this.nodes = new Map();
    this.root = new Set();
    this.packages.forEach(pkg => {
      this.addNode(pkg.name);
    });
  }

  /**
   * Sort a set of nodes by most depended on.
   */
  protected sortByDependedOn(nodes: Set<Node>): Node[] {
    return [...nodes].sort((a, b) => b.dependents.size - a.dependents.size);
  }
}
