import path from 'path';
import { Tool } from '@beemo/core';
import parseSpecialArgv from './parseSpecialArgv';

// 0 node, 1 beemo, 2 command
const { main, parallel } = parseSpecialArgv(process.argv.slice(2));

export const argv = main;

export const parallelArgv = parallel;

export default new Tool({
  argv,
  projectName: path.basename(process.argv[1]).replace('.js', ''), // Windows has an ext
});
