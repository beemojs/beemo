/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import yargs, { Arguments } from 'yargs';
import Beemo from '@beemo/core';
import version from './checkVersion';
import parseSpecialArgv from './parseSpecialArgv';

// 0 node, 1 beemo, 2 command
const { main, parallel } = parseSpecialArgv(process.argv.slice(2));

// Initialize
const binName = path.basename(process.argv[1]);
const beemo = new Beemo(main.slice(1), binName);
const app = yargs(main);
const manualURL = process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo';

// Bootstrap the module
beemo.bootstrapConfigModule();

// Add a command for each driver
beemo.tool.getPlugins('driver').forEach(driver => {
  const { command = {}, metadata } = driver;

  app.command(
    driver.name,
    metadata.description || `Run ${metadata.title}`,
    {
      ...command,
      concurrency: {
        description: 'Number of builds to run in parallel',
        number: true,
      },
      priority: {
        boolean: true,
        default: true,
        description: 'Prioritize workspace builds based on dependency graph',
      },
      workspaces: {
        default: '',
        description: 'Run command in each workspace (supports regex)',
        string: true,
      },
    },
    (args: Arguments) => beemo.executeDriver(args, driver.name, parallel),
  );
});

// Add Beemo commands
app.command(
  ['create-config <name> [names..]', 'config <name> [names..]'],
  'Create a configuration file for the specified drivers',
  {},
  (args: Arguments) => beemo.createConfigFiles(args, args.name, args.names),
);

app.command(
  ['run-script <name>', 'run <name>'],
  'Run custom script from configuration module',
  {},
  (args: Arguments) => beemo.executeScript(args, args.name),
);

app.command(
  'scaffold <generator> <action>',
  'Generate files with templates from configuration module',
  {
    dry: {
      boolean: true,
      default: false,
      description: 'Execute a dry run',
    },
  },
  (args: Arguments) => beemo.scaffold(args, args.generator, args.action),
);

app.command('*', false, {}, () => {
  console.error(chalk.red('Please select a command!'));
});

// Add Beemo options
app
  .option('config', {
    default: '',
    description: 'Path to a configuration file',
    string: true,
  })
  .option('debug', {
    boolean: true,
    default: false,
    description: 'Show debug messages',
  })
  .option('locale', {
    default: '',
    description: 'Locale to display messages in',
    string: true,
  })
  .option('output', {
    default: 3,
    description: 'Control output size',
    number: true,
  })
  .option('silent', {
    boolean: true,
    default: false,
    description: `Hide all output`,
  })
  .option('theme', {
    default: 'default',
    description: 'Change output colors',
    string: true,
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
