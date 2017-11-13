const baseConfig = require('@milesj/build-tool-config/eslint');

module.exports = function (options) {
  console.info('ESLint engine config', options);

  return baseConfig;
};
