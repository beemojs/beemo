const baseBabel = require('@milesj/build-tool-config/configs/babel');

module.exports = function babel(options) {
  Object.assign(options, {
    node: true,
  });

  return baseBabel(options);
};
