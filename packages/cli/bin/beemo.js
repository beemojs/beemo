#!/usr/bin/env node

if (process.env.DEBUG === 'timing') {
  // eslint-disable-next-line
  require('time-require');
}

require('../lib/CLI');
