import corePackage from '@beemo/core/package.json';
import { applyStyle, Program } from '@boost/cli';
import CreateConfig from './commands/CreateConfig';
import RunDriver from './commands/RunDriver';
import RunScript from './commands/RunScript';
import Scaffold from './commands/Scaffold';
import { argv, parallelArgv, tool } from './setup';

const version = String(corePackage.version);
const footer = applyStyle(
  [
    tool.msg('app:cliEpilogue', {
      manualURL: process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo',
    }),
    tool.msg('app:poweredBy', { version }),
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
  // program.onAfterRun.listen(beemo.cleanupOnFailure);

  // Run the program!
  await program.runAndExit(argv, async () => {
    // Load config and plugins
    await tool.bootstrap();

    // Bootstrap config module
    await tool.bootstrapConfigModule();

    // Add a command for each driver
    tool.driverRegistry.getAll().forEach((driver) => {
      program.register(new RunDriver({ driver, parallelArgv }));
    });
  });
}

void run();
