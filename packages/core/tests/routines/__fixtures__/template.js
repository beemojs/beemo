module.exports = function template(configs) {
	const config = {};

	configs.forEach((cfg) => {
		Object.assign(config, cfg);
	});

	return { config };
};
