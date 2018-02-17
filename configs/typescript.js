module.exports = function typeScript() {
  return {
    compilerOptions: {
      esModuleInterop: true,
      module: 'esnext',
      noEmit: true,
      noImplicitAny: true,
      pretty: true,
      sourceMap: true,
    },
  };
};
