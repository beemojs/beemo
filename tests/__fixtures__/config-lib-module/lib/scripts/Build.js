const { Script } = require('@beemo/core');

module.exports = class BuildScript extends Script {
  constructor() {
    super();

    this.lib = true;
  }

  blueprint() {
    return {};
  }
};
