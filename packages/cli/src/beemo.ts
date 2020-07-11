import path from 'path';
import { Tool } from '@beemo/core';
import parseSpecialArgv from './parseSpecialArgv';

// 0 node, 1 beemo, 2 command
const { main, parallel } = parseSpecialArgv(process.argv.slice(2));

export default new Tool({
  argv: main,
  projectName: path.basename(process.argv[1]).replace('.js', ''), // Windows has an ext
});
