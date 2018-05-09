declare module 'yargs-parser' {
  import { Arguments, Options } from 'yargs';

  export default function parseArgs(args: string | string[], options?: Options): Arguments;
}
