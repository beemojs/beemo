const baseConfig = require('@milesj/build-tool-config/eslint');

module.exports = function eslint(options) {
  console.info('ESLint engine config', options);

  return baseConfig;
};
