export interface DependencyMap {
  [module: string]: string;
}

export interface PackageConfig {
  name: string;
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
  peerDependencies?: DependencyMap;
}

export interface TreeNode {
  leaf?: boolean;
  nodes?: TreeNode[];
  package: PackageConfig;
}

export interface TreeRoot {
  nodes: TreeNode[];
  root: boolean;
}
