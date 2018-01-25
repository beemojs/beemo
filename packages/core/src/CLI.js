/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import app from 'yargs';
import Beemo from './Beemo';

// Initialize
const beemo = new Beemo();

// Add a command for each engine
beemo.tool.plugins.forEach((engine) => {
  const { metadata } = engine;
  const command = app.command(
    metadata.bin,
    metadata.description || `Run ${metadata.title}.`,
    () => {
      beemo
        .inheritOptions(app.argv)
        // 0 node, 1 beemo, 2 engine
        .launchEngine(engine.name, process.argv.slice(3));
    },
  );

  // Set Beemo options
  command
    .option('debug', {
      boolean: true,
      default: false,
      describe: 'Show debug messages',
    })
    .option('silent', {
      boolean: true,
      default: false,
      describe: 'Hide engine output',
    });

  // Set additional options
  engine.setOptions(command);
});

// Add Beemo commands
app.command('sync-dotfiles', 'Sync dotfiles from configuration module.', () => {
  beemo.syncDotfiles();
});

// Run application
// eslint-disable-next-line
app
  .usage('beemo <engine> [args..]')
  .demandCommand(1, 'Please run a command.')
  .showHelpOnFail(true)
  .help()
  .argv;
