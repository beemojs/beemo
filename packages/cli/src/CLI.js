/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import Beemo from '@beemo/core';
import app from 'yargs';

// Initialize
const beemo = new Beemo();

// Add a command for each driver
beemo.tool.plugins.forEach((driver) => {
  const { metadata } = driver;

  app.command(
    metadata.bin,
    metadata.description || `Run ${metadata.title}.`,
    (command) => {
      driver.bootstrapCommand(command);

      return command;
    },
    () => {
      beemo
        .inheritOptions(app.argv)
        // 0 node, 1 beemo, 2 driver
        .executeDriver(driver.name, process.argv.slice(3));
    },
  );
});

// Add Beemo commands
app.command('sync-dotfiles', 'Sync dotfiles from configuration module.', () => {
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
    describe: 'Hide driver output',
  });

// Run application
// eslint-disable-next-line
app
  .usage('beemo <driver> [args..]')
  .demandCommand(1, 'Please run a command.')
  .showHelpOnFail(true)
  .help()
  .argv;
