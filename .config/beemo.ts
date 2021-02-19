export default {
  module: '@beemo/local',
  drivers: {
    babel: true,
    eslint: true,
    jest: true,
    mocha: true,
    prettier: true,
    rollup: true,
    stylelint: true,
    typescript: {
      buildFolder: 'dts',
      declarationOnly: true,
    },
    webpack: true,
  },
  settings: {
    decorators: true,
    node: true,
  },
};
