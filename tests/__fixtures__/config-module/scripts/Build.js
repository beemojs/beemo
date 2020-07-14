const { Script } = require('@beemo/core');

class BuildScript extends Script {
  constructor() {
    super();

    this.name = 'config-script-build';
    this.lib = false;
  }

  execute() {}
}

module.exports = function build() {
  return new BuildScript();
};
