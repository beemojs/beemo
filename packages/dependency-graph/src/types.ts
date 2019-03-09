export interface DependencyMap {
  [module: string]: string;
}

export interface PackageConfig {
  name: string;
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
  peerDependencies?: DependencyMap;
}

export interface TreeNode<T extends PackageConfig> {
  nodes?: TreeNode<T>[];
  package: T;
}

export interface Tree<T extends PackageConfig> {
  nodes: TreeNode<T>[];
  root: boolean;
}
