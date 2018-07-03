/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import yargs, { Arguments } from 'yargs';
import Beemo, { Driver } from '@beemo/core';
import version from './checkVersion';
import quoteSpecialOptions from './quoteSpecialOptions';

// 0 node, 1 beemo, 2 <driver, command>
const argv = quoteSpecialOptions(process.argv.slice(2));

// Initialize
const beemo = new Beemo(argv.slice(1));
const app = yargs(argv);
const binName = path.basename(process.argv[1]);
const manualURL = process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo';

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
      concurrency: {
        description: 'Number of builds to run in parallel',
        number: true,
      },
      parallel: {
        array: true,
        default: [],
        description: 'Run parallel builds with additional flags or options',
      },
      priority: {
        boolean: true,
        default: false,
        description: 'Prioritize workspace builds based on dependency graph',
      },
      workspaces: {
        default: '',
        description: 'Run command in each workspace (supports regex)',
        string: true,
      },
    },
    (args: Arguments) => beemo.executeDriver(driver.name, args),
  );
});

// Add Beemo commands
app.command(
  ['run-script <name>', 'run <name>'],
  'Run custom script from configuration module',
  {},
  (args: Arguments) => beemo.executeScript(args.name, args),
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
  (args: Arguments) => beemo.syncDotfiles(args),
);

app.command('*', false, {}, () => {
  console.error(chalk.red('Please select a command!'));
});

// Add Beemo options
app
  .option('debug', {
    boolean: true,
    default: false,
    description: 'Show debug messages',
  })
  .option('silent', {
    boolean: true,
    default: false,
    description: `Hide ${binName} output`,
  })
  .option('theme', {
    default: 'default',
    description: 'Change output colors',
    string: true,
  })
  .option('verbose', {
    default: 3,
    description: 'Control output size',
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
