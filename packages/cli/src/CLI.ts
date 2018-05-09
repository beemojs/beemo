/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console, unicorn/no-process-exit */

import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import yargs from 'yargs';
import Beemo, { Driver } from '@beemo/core';
// @ts-ignore
import corePackage from '../../core/package.json';
// @ts-ignore
import cliPackage from '../package.json';

const peerVersion = cliPackage.peerDependencies['@beemo/core'];
const binName = path.basename(process.argv[1]);
const manualURL = process.env.MANUAL_URL || 'https://milesj.gitbooks.io/beemo';

if (!semver.satisfies(cliPackage.version, `^${corePackage.version}`)) {
  console.error(chalk.red(`@beemo/cli version out of date; must be ^${corePackage.version}.`));
  process.exit(1);
} else if (peerVersion.charAt(1) !== '0' && !semver.satisfies(corePackage.version, peerVersion)) {
  console.error(
    chalk.red('@beemo/core mismatched version. Please keep core and cli package versions in sync.'),
  );
  process.exit(2);
}

// Initialize
// 0 node, 1 beemo, 2 <driver, command>
const beemo = new Beemo(process.argv.slice(3));
const app = yargs(process.argv.slice(2));

// Bootstrap the module
beemo.bootstrapConfigModule();

// Add a command for each driver
beemo.tool.plugins.forEach(driver => {
  const { command = {}, metadata } = driver as Driver;

  app.command(
    driver.name,
    metadata.description || `Run ${metadata.title}`,
    {
      ...command,
      workspaces: {
        boolean: true,
        default: false,
        description: 'Run command in all workspaces',
      },
    },
    () => beemo.executeDriver(driver.name),
  );
});

// Add Beemo commands
app.command(
  ['run-script <name>', 'run <name>'],
  'Run custom script from configuration module',
  {},
  args => beemo.executeScript(args.name),
);

app.command(
  ['sync-dotfiles', 'sync'],
  'Sync dotfiles from configuration module',
  {
    filter: {
      alias: 'f',
      default: '',
      description: 'Filter filenames using a regex pattern',
      string: true,
    },
  },
  args => beemo.syncDotfiles(args.filter),
);

app.command('*', false, {}, () => {
  console.error(chalk.red('Please select a command!'));
});

// Add Beemo options
app
  .option('debug', {
    boolean: true,
    default: false,
    describe: 'Show debug messages',
  })
  .option('silent', {
    boolean: true,
    default: false,
    describe: `Hide ${binName} output`,
  })
  .option('verbose', {
    default: 3,
    describe: 'Increase informational output',
    number: true,
  });

// Run application
app
  .usage(`${binName} <command> [args..]`)
  .epilogue(
    chalk.gray(
      [
        `For more information, view the manual: ${manualURL}`,
        `Powered by Beemo v${corePackage.version}`,
      ].join('\n'),
    ),
  )
  .demandCommand(1, chalk.red('Please select a command!'))
  .showHelpOnFail(true)
  .help()
  .parse();
