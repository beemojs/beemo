const MockScript = require.requireActual('../../../src/Script').default;

module.exports = class FromNodeModuleScript extends MockScript {
	blueprint() {
		return {};
	}

	execute() {
		// eslint-disable-next-line no-magic-numbers
		return 123;
	}
};
