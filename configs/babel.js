module.exports = function babel() {
  return {
    babelrc: false,
    comments: false,
    plugins: ['@babel/plugin-proposal-class-properties'],
    presets: [['@babel/preset-env', { targets: { node: process.version.slice(1) } }]],
  };
};
