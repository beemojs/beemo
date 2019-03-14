/* eslint-disable no-console */

import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';
import Beemo from '@beemo/core';
// @ts-ignore
import corePackage from '@beemo/core/package.json';
import parseSpecialArgv from './parseSpecialArgv';

// 0 node, 1 beemo, 2 command
const { main, parallel } = parseSpecialArgv(process.argv.slice(2));

// Initialize
const binName = path.basename(process.argv[1]);
const beemo = new Beemo(main.slice(1), binName);
const { tool } = beemo;
const app = yargs(main);
const manualURL = process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo';

// Bootstrap the module
beemo.bootstrapConfigModule();

// Register global options
beemo.bootstrapCLI(app);

// Add a command for each driver
tool.getPlugins('driver').forEach(driver => {
  const { command, metadata } = driver;

  app.command(
    driver.name,
    metadata.description || tool.msg('app:run', { title: metadata.title }),
    cmd => {
      Object.keys(command).forEach(key => {
        cmd.option(key, command[key]);
      });

      return cmd
        .option('concurrency', {
          default: 0,
          description: tool.msg('app:cliOptionConcurrency'),
          number: true,
        })
        .option('live', {
          boolean: true,
          default: false,
          description: tool.msg('app:cliOptionLive'),
        })
        .option('priority', {
          boolean: true,
          default: true,
          description: tool.msg('app:cliOptionPriority'),
        })
        .option('workspaces', {
          default: '',
          description: tool.msg('app:cliOptionWorkspaces'),
          string: true,
        });
    },
    args => beemo.executeDriver(args, driver.name, parallel),
  );
});

// Add Beemo commands
app.command(
  ['create-config [names..]', 'config [names..]'],
  tool.msg('app:cliCommandConfig'),
  cmd =>
    cmd.positional('names', {
      default: [],
      description: tool.msg('app:cliArgConfigNames'),
      type: 'string',
    }),
  args => beemo.createConfigFiles(args, args.names),
);

app.command(
  ['run-script <name>', 'run <name>'],
  tool.msg('app:cliCommandRunScript'),
  cmd =>
    cmd
      .positional('name', {
        default: '',
        description: tool.msg('app:cliArgScriptName'),
        type: 'string',
      })
      .option('concurrency', {
        default: 0,
        description: tool.msg('app:cliOptionConcurrency'),
        number: true,
      })
      .option('live', {
        boolean: true,
        default: false,
        description: tool.msg('app:cliOptionLive'),
      })
      .option('priority', {
        boolean: true,
        default: false,
        description: tool.msg('app:cliOptionPriority'),
      })
      .option('workspaces', {
        default: '',
        description: tool.msg('app:cliOptionWorkspaces'),
        string: true,
      }),
  args => beemo.executeScript(args, args.name),
);

app.command(
  'scaffold <generator> <action> [name]',
  tool.msg('app:cliCommandScaffold'),
  cmd =>
    cmd
      .positional('generator', {
        default: '',
        description: tool.msg('app:cliArgGenerator'),
        type: 'string',
      })
      .positional('action', {
        default: '',
        description: tool.msg('app:cliArgGeneratorAction'),
        type: 'string',
      })
      .positional('name', {
        default: '',
        description: tool.msg('app:cliArgGeneratorName'),
        type: 'string',
      })
      .option('dry', {
        boolean: true,
        default: false,
        description: tool.msg('app:cliOptionDryRun'),
      }),
  args => beemo.scaffold(args, args.generator, args.action, args.name),
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
      tool.msg('app:poweredBy', { version: corePackage.version })
    ].join('\n')),
  )
  .demandCommand(1, chalk.red(tool.msg('errors:cliNoCommand')))
  .showHelpOnFail(true)
  .help().argv;
