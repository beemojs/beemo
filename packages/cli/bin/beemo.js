#!/usr/bin/env node
/* eslint-disable */

const debug = require('debug');

// Instrument our CLI for require() performance
if (process.env.DEBUG === 'timing') {
  require('time-require');

  // Boost doesn't enable the debugger early enough,
  // so enable it here if we encounter the debug flag.
} else if (process.argv.includes('--debug')) {
  debug.enable('beemo:*');
}

require('../lib/CLI');
