/* eslint-disable import/no-extraneous-dependencies */

import debug from 'debug';
import { Tool } from '@beemo/core';
import parseSpecialArgv from './parseSpecialArgv';

const projectName = process.env.BEEMO_BRAND_NAME || 'beemo';

process.env.BOOSTJS_DEBUG_NAMESPACE = projectName;

// Instrument our CLI for require() performance
if (process.env.TIMING) {
  // eslint-disable-next-line global-require
  require('time-require');

  // Boost doesn't enable the debugger early enough,
  // so enable it here if we encounter the debug flag.
} else if (process.argv.includes('--debug')) {
  debug.enable(`${projectName}:*`);
}

export const { argv, parallelArgv } = parseSpecialArgv(process.argv.slice(2));

export const beemo = new Tool({
  argv,
  projectName,
});
