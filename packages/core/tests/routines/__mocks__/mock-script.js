const MockScript = require.requireActual('../../../src/Script').default;

module.exports = class FromNodeModuleScript extends MockScript {
  blueprint() {
    return {};
  }

  execute() {
    // eslint-disable-next-line
    return 123;
  }
};
