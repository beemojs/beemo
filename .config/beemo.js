module.exports = {
  module: '@beemo/local',
  // drivers: ['babel', 'eslint', 'jest', 'mocha', 'prettier', 'typescript', 'webpack'],
  drivers: {
    babel: true,
    eslint: true,
    jest: true,
    mocha: true,
    prettier: true,
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
