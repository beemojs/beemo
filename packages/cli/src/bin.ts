import CreateConfig from './commands/CreateConfig';
import RunDriver from './commands/RunDriver';
import RunScript from './commands/RunScript';
import Scaffold from './commands/Scaffold';
import { argv, parallelArgv, program, tool } from './setup';

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

  // Run the program!
  await program.runAndExit(argv, async () => {
    // Load config and plugins
    await tool.bootstrap();

    // Bootstrap config module
    await tool.bootstrapConfigModule();

    // Add a command for each driver
    tool.driverRegistry.getAll().forEach((driver) => {
      program.register(new RunDriver({ driver, parallelArgv }));

      // Register sub-commands for the driver
      driver.commands.forEach((command) => {
        program.register(
          `${driver.getName()}:${command.path}`,
          {
            ...command.config,
            category: 'driver',
          },
          command.runner,
        );
      });
    });
  });
}

void run();
