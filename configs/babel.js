const baseBabel = require('@milesj/build-tool-config/configs/babel');

module.exports = function babel(options) {
  return baseBabel(
    Object.assign(options, {
      node: true,
    }),
  );
};
