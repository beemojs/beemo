/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable no-console, unicorn/no-process-exit */

import chalk from 'chalk';
import semver from 'semver';
import app from 'yargs';
import Beemo from '@beemo/core';
import corePackage from '@beemo/core/package.json';
import cliPackage from '../package.json';

const peerVersion = cliPackage.peerDependencies['@beemo/core'];

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

// Add a command for each driver
beemo.tool.plugins.forEach(driver => {
  const { command = {}, metadata } = driver;

  app.command(
    driver.name,
    metadata.description || `Run ${metadata.title}.`,
    command,
    () => beemo.executeDriver(driver.name),
  );
});

// Add Beemo commands
app.command(
  ['run-script <name>', 'run <name>'],
  'Run script from configuration module.',
  {},
  args => {
    beemo.executeScript(args.name);
  },
);

app.command(['sync-dotfiles', 'sync'], 'Sync dotfiles from configuration module.', {}, () => {
  beemo.syncDotfiles();
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
    describe: 'Hide Beemo output',
  });

// Run application
// eslint-disable-next-line
app
  .usage('beemo <command> [args..]')
  .demandCommand(1, 'Please select a command.')
  .showHelpOnFail(true)
  .help().argv;
