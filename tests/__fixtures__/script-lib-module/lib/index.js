const { Script } = require('@beemo/core');

class BuildScript extends Script {
  constructor() {
    super();

    this.name = 'script-lib-build';
    this.lib = true;
  }

  execute() {}
}

module.exports = function build() {
  return new BuildScript();
};
