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

  app.command(metadata.bin, metadata.description || `Run ${metadata.title}.`, () => {
    // 0 node
    // 1 rocket
    // 2 <engine>
    rocket.launchEngine(engine.name, process.argv.slice(3));
  });
});

// Run application
// eslint-disable-next-line
app
  .usage('rocket <engine> [args..]')
  .help()
  .argv;
