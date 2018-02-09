const baseBabel = require('@milesj/build-tool-config/configs/babel');

module.exports = function babel(options) {
  return baseBabel({
    ...options,
    node: true,
  });
};
