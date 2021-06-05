import { FlowConfig } from '@beemo/driver-flow';

const config: FlowConfig = {
	ignore: ['.*/node_modules/.*', '.*/tests/.*', '.*\\.test\\.js'],
	include: ['./src'],
	lints: {
		all: 'off',
	},
	options: {
		emoji: true,
		'esproposal.class_instance_fields': 'enable',
		'esproposal.class_static_fields': 'enable',
		'esproposal.export_star_as': 'enable',
		include_warnings: true,
		'module.ignore_non_literal_requires': true,
	},
};

export default config;
