import { Argv } from '@beemo/core';

export interface ParsedArgv {
  argv: Argv;
  parallelArgv: Argv[];
}

/**
 * Extract parallel commands and options into separate argv lists.
 */
export function parseSpecialArgv(argv: Argv): ParsedArgv {
  const main: Argv = [];
  const parallel: Argv[] = [];
  let index = -1;

  argv.forEach((arg) => {
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

  return { argv: main, parallelArgv: parallel };
}
