export default {
	rules: {
		// Breaks on Windows but not Linux/macOS
		'import/named': 'off',
		// Rewrites our type exports
		'unicorn/prefer-export-from': 'off',
	},
};
