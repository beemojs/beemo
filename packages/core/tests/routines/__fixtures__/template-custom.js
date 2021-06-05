module.exports = function customPath(configs, options) {
	return {
		config: `
foo: bar
list:
  - 1
  - 2
  - 3
    `.trim(),
		path: options.context.cwd.append('babel.yaml'),
	};
};
