const execa = require('execa');

const bin = process.argv[2];
const pattern = /\s+-?-[a-z0-9-]+(,|\s)/giu;

if (!bin) {
  throw new Error('Please pass a NPM binary name.');
}

execa('npx', [bin, '--help'])
  .then(({ stdout }) => {
    const args = new Set();

    stdout.match(pattern).forEach(opt => {
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

      args.add(option);
    });

    Array.from(args).forEach(arg => {
      console.log(`${arg}?: string;`);
    });

    return true;
  })
  .catch(() => {});
