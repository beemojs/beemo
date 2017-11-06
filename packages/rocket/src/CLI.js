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

  app.command(meta.bin, meta.description || `Run ${meta.title}.`, (argv) => {
    console.log(argv, engine);
    rocket.launch(engine.name, options.args);
  });
});

// Run application
// eslint-disable-next-line
app
  .command('*', 'Display all loaded engines.', () => {}, () => {
    app.help();
  })
  .usage('rocket <engine> [args..]')
  .help()
  .argv;
