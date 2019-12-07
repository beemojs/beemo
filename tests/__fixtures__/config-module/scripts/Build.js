const { Script } = require('@beemo/core');

module.exports = class BuildScript extends Script {
  constructor() {
    super();

    this.lib = false;
  }

  blueprint() {
    return {};
  }
};
