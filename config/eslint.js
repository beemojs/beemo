module.exports = function (options) {
  console.info('ESLint engine config', options);

  return {
    root: true,
    env: {
      node: true,
    },
  };
};
