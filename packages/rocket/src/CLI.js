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
  const { meta, options } = engine;

  app.command(meta.bin, meta.description || `Run ${meta.title}.`, () => {
    rocket.launch(engine.name, [
      ...options.args,
      ...process.argv.slice(3),
    ]);
  });
});

// Run application
// eslint-disable-next-line
app
  .usage('rocket <engine> [args..]')
  .help()
  .argv;
