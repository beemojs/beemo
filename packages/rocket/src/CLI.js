/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import app from 'yargs';
import Rocket from './Rocket';

// Initialize rocket
const rocket = new Rocket();

// Add a command for each engine
rocket.tool.plugins.forEach((engine) => {
  const { metadata } = engine;
  const command = app.command(
    metadata.bin,
    metadata.description || `Run ${metadata.title}.`,
    () => {
      rocket
        .inheritOptions(app.argv)
        // 0 node, 1 rocket, 2 engine
        .launchEngine(engine.name, process.argv.slice(3));
    },
  );

  // Set Rocket options
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

// Add rocket commands
app.command('sync-dotfiles', 'Sync dotfiles from configuration module.', () => {
  rocket.syncDotfiles();
});

// Run application
// eslint-disable-next-line
app
  .usage('rocket <engine> [args..]')
  .demandCommand(1, 'Please run a command.')
  .showHelpOnFail(true)
  .help()
  .argv;
