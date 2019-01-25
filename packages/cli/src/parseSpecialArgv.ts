/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Argv } from '@beemo/core';

export interface ParsedArgv {
  main: Argv;
  parallel: Argv[];
}

/**
 * Extract parallel commands and options into separate argv lists.
 */
export default function parseSpecialArgv(argv: Argv): ParsedArgv {
  const main: Argv = [];
  const parallel: Argv[] = [];
  let index = -1;

  argv.forEach(arg => {
    if (arg === '//') {
      index += 1;
    } else if (index >= 0) {
      if (parallel[index]) {
        parallel[index].push(arg);
      } else {
        parallel[index] = [arg];
      }
    } else {
      main.push(arg);
    }
  });

  return { main, parallel };
}
