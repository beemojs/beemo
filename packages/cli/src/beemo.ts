// import path from 'path';
import { Tool } from '@beemo/core';
import parseSpecialArgv from './parseSpecialArgv';

process.env.BOOSTJS_DEBUG_NAMESPACE = 'beemo';

const [, , /* bin */ ...restArgv] = process.argv;
const { main, parallel } = parseSpecialArgv(restArgv);

export const argv = main;

export const parallelArgv = parallel;

export const beemo = new Tool({
  argv,
  // projectName: path.basename(bin).replace('.js', ''), // Windows has an ext
});
