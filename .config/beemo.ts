export default {
	module: '@beemo/local',
	drivers: [
		'babel',
		'eslint',
		'jest',
		'lerna',
		'mocha',
		'prettier',
		'rollup',
		'stylelint',
		[
			'typescript',
			{
				buildFolder: 'dts',
				declarationOnly: true,
			},
		],
		'webpack',
	],
	settings: {
		decorators: true,
		node: true,
		// Docusaurus
		react: true,
	},
};
