/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/**
 * Quote the values of special options so that yargs doesnt parse any
 * flags/options within the value.
 */
export default function quoteSpecialOptions(argv: string[]): string[] {
  const args: string[] = [];

  argv.forEach(arg => {
    if (arg.startsWith('--parallel')) {
      if (arg.includes('=')) {
        const [opt, value] = arg.split('=', 2);

        args.push(`${opt}="${value}"`);
      }
    } else {
      args.push(arg);
    }
  });

  return args;
}
