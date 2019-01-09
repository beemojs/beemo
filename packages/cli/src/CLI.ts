/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';
import Beemo, { ConfigContext, DriverContext, ScriptContext, ScaffoldContext } from '@beemo/core';
import version from './checkVersion';
import parseSpecialArgv from './parseSpecialArgv';

// 0 node, 1 beemo, 2 command
const { main, parallel } = parseSpecialArgv(process.argv.slice(2));

// Initialize
const binName = path.basename(process.argv[1]);
const beemo = new Beemo(main.slice(1), binName);
const { tool } = beemo;
const app = yargs(main) as any; // TEMP as yargs types are broken
const manualURL = process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo';

// Bootstrap the module
beemo.bootstrapConfigModule();

// Register global options
beemo.bootstrapCLI(app as any);

// Add a command for each driver
tool.getPlugins('driver').forEach(driver => {
  const { command, metadata } = driver;

  app.command(
    driver.name,
    metadata.description || tool.msg('app:run', { title: metadata.title }),
    {
      ...command,
      concurrency: {
        description: tool.msg('app:cliOptionConcurrency'),
        number: true,
      },
      priority: {
        boolean: true,
        description: tool.msg('app:cliOptionPriority'),
      },
      workspaces: {
        description: tool.msg('app:cliOptionWorkspaces'),
        string: true,
      },
    },
    (args: DriverContext['args']) => beemo.executeDriver(args, driver.name, parallel),
  );
});

// Add Beemo commands
app.command(
  ['create-config [names..]', 'config [names..]'],
  tool.msg('app:cliCommandConfig'),
  {},
  (args: ConfigContext['args']) => beemo.createConfigFiles(args, args.names),
);

app.command(
  ['run-script <name>', 'run <name>'],
  tool.msg('app:cliCommandRunScript'),
  {
    concurrency: {
      description: tool.msg('app:cliOptionConcurrency'),
      number: true,
    },
    workspaces: {
      description: tool.msg('app:cliOptionWorkspaces'),
      string: true,
    },
  },
  (args: ScriptContext['args']) => beemo.executeScript(args, args.name),
);

app.command(
  'scaffold <generator> <action>',
  tool.msg('app:cliCommandScaffold'),
  {
    dry: {
      boolean: true,
      default: false,
      description: tool.msg('app:cliOptionDryRun'),
    },
  },
  (args: ScaffoldContext['args']) => beemo.scaffold(args, args.generator, args.action),
);

app.command('*', false, {}, () => {
  console.error(chalk.red(tool.msg('errors:cliNoCommand')));
});

// Run application
// eslint-disable-next-line no-unused-expressions
app
  .usage(`${binName} <command> [args..]`)
  .epilogue(
    // prettier-ignore
    chalk.gray([
      tool.msg('app:cliEpilogue', { manualURL }),
      tool.msg('app:poweredBy', { version })
    ].join('\n')),
  )
  .demandCommand(1, chalk.red(tool.msg('errors:cliNoCommand')))
  .showHelpOnFail(true)
  .help().argv;
