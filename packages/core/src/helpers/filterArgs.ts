import { Argv } from '../types';

export interface OptionMap {
  [option: string]: boolean;
}

export interface FilterArgOptions {
  allow?: OptionMap;
  block?: OptionMap;
}

export default function filterArgs(argv: Argv, { allow, block }: FilterArgOptions) {
  const filteredArgv: Argv = [];
  const unknownArgv: Argv = [];
  const isInvalid = (option: string) => {
    return (allow && !allow[option]) || (block && block[option]);
  };
  let skipNext = false;

  argv.forEach((arg, i) => {
    if (skipNext) {
      skipNext = false;

      return;
    }

    if (arg.startsWith('-')) {
      let option = arg;
      const nextArg = argv[i + 1];

      // --opt=123
      if (option.includes('=')) {
        [option] = option.split('=');

        if (isInvalid(option)) {
          unknownArgv.push(arg);

          return;
        }

        // --opt 123
      } else if (isInvalid(option)) {
        unknownArgv.push(arg);

        if (nextArg && !nextArg.startsWith('-')) {
          skipNext = true;
          unknownArgv.push(nextArg);
        }

        return;
      }
    }

    filteredArgv.push(arg);
  });

  return {
    filteredArgv,
    unknownArgv,
  };
}
