/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import app from 'yargs';
import Droid from './Droid';

// Initialize
const droid = new Droid();

// Add a command for each engine
droid.tool.plugins.forEach((engine) => {
  const { metadata } = engine;
  const command = app.command(
    metadata.bin,
    metadata.description || `Run ${metadata.title}.`,
    () => {
      droid
        .inheritOptions(app.argv)
        // 0 node, 1 droid, 2 engine
        .launchEngine(engine.name, process.argv.slice(3));
    },
  );

  // Set Droid options
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

// Add Droid commands
app.command('sync-dotfiles', 'Sync dotfiles from configuration module.', () => {
  droid.syncDotfiles();
});

// Run application
// eslint-disable-next-line
app
  .usage('droid <engine> [args..]')
  .demandCommand(1, 'Please run a command.')
  .showHelpOnFail(true)
  .help()
  .argv;
