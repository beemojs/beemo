declare module 'yargs-parser' {
  import { Arguments, Options } from 'yargs';

  export default function parse(args: string | string[], options?: Options): Arguments;
}
