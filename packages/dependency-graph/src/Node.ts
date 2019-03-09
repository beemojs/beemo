export default class Node {
  name: string;

  dependents: Set<Node> = new Set();

  requirements: Set<Node> = new Set();

  constructor(name: string) {
    this.name = name;
  }
}
