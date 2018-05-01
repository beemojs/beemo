const baseBabel = require('@milesj/build-tool-config/configs/babel');

module.exports = function babel(args) {
  Object.assign(args, {
    node: true,
  });

  return baseBabel(args);
};
