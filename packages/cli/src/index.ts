import { Program, applyStyle } from '@boost/cli';
// @ts-ignore
import corePackage from '@beemo/core/package.json';
import beemo from './beemo';
import RunDriver from './commands/RunDriver';
import CreateConfig from './commands/CreateConfig';
import RunScript from './commands/RunScript';
import Scaffold from './commands/Scaffold';

const program = new Program({
  bin: 'beemo',
  footer: applyStyle(
    [
      beemo.msg('app:cliEpilogue', {
        manualURL: process.env.BEEMO_MANUAL_URL || 'https://milesj.gitbook.io/beemo',
      }),
      beemo.msg('app:poweredBy', { version: corePackage.version }),
    ].join('\n'),
    'muted',
  ),
  name: 'Beemo',
  // eslint-disable-next-line
  version: require('@beemo/core/package.json').version,
});

async function run() {
  // Load config and plugins
  await beemo.bootstrap();

  // Bootstrap config module
  await beemo.bootstrapConfigModule();

  // Add a command for each driver
  beemo.driverRegistry.getAll().forEach((driver) => {
    program.register(new RunDriver({ driver, parallelArgv: parallel }));
  });

  // Add normal commands
  program
    .register(new CreateConfig())
    .register(new RunScript())
    .register(new Scaffold());

  // Run the program!
  await program.runAndExit(main);
}

run();
