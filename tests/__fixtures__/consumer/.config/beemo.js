module.exports = {
  configure: {
    parallel: false,
  },
  drivers: ['babel'],
  // drivers: {
  //   babel: false,
  //   jest: {
  //     env: { NODE_ENV: 'test' },
  //   },
  // },
  module: '@beemo/dev',
  scripts: ['build', 'init'],
  settings: {
    customValue: true,
  },
};
