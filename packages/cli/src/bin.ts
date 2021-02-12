import corePackage from '@beemo/core/package.json';
import { applyStyle, Program } from '@boost/cli';
import { argv, beemo, parallelArgv } from './setup';
import CreateConfig from './commands/CreateConfig';
import RunDriver from './commands/RunDriver';
import RunScript from './commands/RunScript';
import Scaffold from './commands/Scaffold';

const version = String(corePackage.version);
const footer = applyStyle(
  [
    beemo.msg('app:cliEpilogue', {
      manualURL: process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo',
    }),
    beemo.msg('app:poweredBy', { version }),
  ].join('\n'),
  'muted',
);

const program = new Program({
  bin: 'beemo',
  footer,
  name: 'Beemo',
  version,
});

async function run() {
  // Run this in middleware so we can utilize error handling
  // program.middleware(async (v, parse) => {});

  // Load config and plugins
  await beemo.bootstrap();

  // Bootstrap config module
  await beemo.bootstrapConfigModule();

  // Add a command for each driver
  beemo.driverRegistry.getAll().forEach((driver) => {
    program.register(new RunDriver({ driver, parallelArgv }));
  });

  // Add normal commands
  program
    .register(new CreateConfig())
    .register(new RunDriver())
    .register(new RunScript())
    .register(new Scaffold());

  // Add categories
  program.categories({
    core: 'Core',
    driver: 'Drivers',
    script: 'Scripts',
  });

  // Listen to events
  program.onAfterRun.listen(beemo.cleanupOnFailure);

  // Run the program!
  await program.runAndExit(argv);
}

void run();
