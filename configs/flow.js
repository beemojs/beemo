const ignore = ['.*/node_modules/.*', '.*/tests/.*', '.*\\.test\\.js'];

module.exports = {
  ignore,
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
