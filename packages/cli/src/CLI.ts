/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import yargs from 'yargs';
import Beemo, { Driver } from '@beemo/core';
import version from './versionCheck';

// Initialize
// 0 node, 1 beemo, 2 <driver, command>
const beemo = new Beemo(process.argv.slice(3));
const app = yargs(process.argv.slice(2));
const binName = path.basename(process.argv[1]);
const manualURL = process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbooks.io/beemo';

// Bootstrap the module
beemo.bootstrapConfigModule();

// Add a command for each driver
beemo.tool.plugins.forEach(driver => {
  const { command = {}, metadata } = driver as Driver<any>;

  app.command(
    driver.name,
    metadata.description || `Run ${metadata.title}`,
    {
      ...command,
      priority: {
        default: '',
        description: 'Workspaces to run first (supports regex)',
        string: true,
      },
      workspaces: {
        default: '',
        description: 'Run command in workspaces (supports regex)',
        string: true,
      },
    },
    args => beemo.executeDriver(driver.name, args),
  );
});

// Add Beemo commands
app.command(
  ['run-script <name>', 'run <name>'],
  'Run custom script from configuration module',
  {},
  args => beemo.executeScript(args.name, args),
);

app.command(
  ['sync-dotfiles', 'sync'],
  'Sync dotfiles from configuration module',
  {
    filter: {
      alias: 'f',
      default: '',
      description: 'Filter filenames (supports regex)',
      string: true,
    },
  },
  args => beemo.syncDotfiles(args),
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
    describe: 'Control output size',
    number: true,
  });

// Run application
// eslint-disable-next-line no-unused-expressions
app
  .usage(`${binName} <command> [args..]`)
  .epilogue(
    chalk.gray(
      [`For more information, view the manual: ${manualURL}`, `Powered by Beemo v${version}`].join(
        '\n',
      ),
    ),
  )
  .demandCommand(1, chalk.red('Please select a command!'))
  .showHelpOnFail(true)
  .help().argv;
