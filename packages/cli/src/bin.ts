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
      const command = new RunDriver({ driver, parallelArgv });

      // Path is required for sub-command registration
      command.constructor.path = driver.getName();

      // Register sub-commands for the driver
      driver.commands.forEach(({ path, config, runner }) => {
        command.register<{}, []>(
          `${driver.getName()}:${path}`,
          { ...config, category: 'driver' },
          (options, params, rest) => runner(tool, options, params, rest),
        );
      });

      program.register(command);
    });
  });
}

void run();
