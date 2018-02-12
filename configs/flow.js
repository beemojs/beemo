// const baseFlow = require('@milesj/build-tool-config/configs/flow');

module.exports = function flow(options) {
  // return {
  //   ...baseFlow(options),
  // libs: [
  //   './packages/core/beemo.js.flow',
  //   './node_modules/boost/boost.js.flow',
  //   './node_modules/optimal/optimal.js.flow',
  // ],
  // };

  const ignore = [
    '.*/node_modules/.*',
    '.*/tests/.*',
    '.*\\.test\\.js',
    '.*/packages/driver-flow/integration/.*',
  ];

  if (options.workspaces) {
    ignore.push('.*/packages/.*/esm/.*', '.*/packages/.*/lib/.*');
  }

  return {
    ignore,
    include: [options.workspaces ? './packages' : './src'],
    libs: [
      './packages/core/beemo.js.flow',
      './node_modules/boost/boost.js.flow',
      './node_modules/optimal/optimal.js.flow',
    ],
    lints: {
      all: 'warn',
      sketchy_null_bool: 'off',
      sketchy_null_mixed: 'off',
      sketchy_null_number: 'off',
      sketchy_null_string: 'off',
      unclear_type: 'off',
      untyped_import: 'off',
    },
    options: {
      emoji: true,
      'esproposal.class_instance_fields': 'enable',
      'esproposal.class_static_fields': 'enable',
      'esproposal.export_star_as': 'enable',
      include_warnings: true,
      'module.ignore_non_literal_requires': true,
      suppress_comment: '\\\\(.\\\\|\\n\\\\)*\\\\$FlowIgnore',
    },
  };
};
