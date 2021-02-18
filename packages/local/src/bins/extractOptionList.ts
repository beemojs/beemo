import execa from 'execa';

const bin = process.argv[2];

if (!bin) {
  throw new Error('Please pass a NPM binary name.');
}

const OPTION_PATTERN = /\s+-?-[a-z0-9-]+(,|\s)/giu;
const IS_STRING = /\[?string\]?\b/iu;
const IS_STRING_NAMED = /\[(\w+)\]\b/iu;
const IS_NUMBER = /\[?(number|int)\]?\b/iu;
const IS_OBJECT = /\[?object\]?\b/iu;
const IS_ARRAY = /\[?(array|list)\]?\b/iu;

function determineType(line: string): string {
  const brackets = line.match(IS_ARRAY) ? '[]' : '';

  if (line.match(IS_STRING) || line.match(IS_STRING_NAMED)) {
    return `string${brackets}`;
  }

  if (line.match(IS_NUMBER) && !line.includes('version')) {
    return `number${brackets}`;
  }

  if (line.match(IS_OBJECT)) {
    return `object${brackets}`;
  }

  if (brackets) {
    return `string[]`;
  }

  return 'boolean';
}

const binArgs = bin === 'tsc' ? ['--help', '--all'] : ['--help'];

execa('npx', [bin, ...binArgs])
  .then(({ stdout }) => {
    const optionTypes = new Map<string, string>();

    stdout.split('\n').forEach((line) => {
      const result = line.match(OPTION_PATTERN);

      if (!result) {
        return;
      }

      const type = determineType(line);

      result.forEach((opt) => {
        let option = opt.trim();

        // Trim trailing comma
        if (option.slice(-1) === ',') {
          option = option.slice(0, -1);
        }

        // Remove leading dash
        option = option.replace(/^-{1,2}/u, '');

        // Remove leading no-
        option = option.replace(/^no-/u, '');

        // Camel case
        option = option.replace(/-([a-z])/gu, (match, char) => char.toUpperCase());

        optionTypes.set(option, type);
      });
    });

    const args = Array.from(optionTypes.entries());

    args.sort((a, b) => a[0].localeCompare(b[0]));

    args.forEach((arg) => {
      console.log(`${arg[0]}?: ${arg[1]};`);
    });

    return true;
  })
  .catch(() => {});
