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
rocket.getEngines().forEach((engine) => {
  const { meta } = engine;

  app.command(meta.bin, meta.description || `Run ${meta.title}.`, () => {
    // 0 node
    // 1 rocket
    // 2 <engine>
    rocket.launch(engine.name, process.argv.slice(3));
  });
});

// Run application
// eslint-disable-next-line
app
  .usage('rocket <engine> [args..]')
  .help()
  .argv;
