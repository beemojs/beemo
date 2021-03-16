import { Driver, DriverContextOptions } from '@beemo/core';
import { Argv, Config } from '@boost/cli';
import BaseRunCommand from './commands/BaseRunCommand';
import { tool } from './setup';

export default function createDriverCommand(
  driver: Driver,
  parallelArgv?: Argv[],
): BaseRunCommand<DriverContextOptions, []> {
  const path = driver.getName();

  @Config(path, tool.msg('app:cliCommandRunDriver'), {
    allowUnknownOptions: true,
    allowVariadicParams: true,
    category: 'driver',
  })
  class RunExplicitDriver extends BaseRunCommand<DriverContextOptions, []> {
    async run() {
      const pipeline = tool.createRunDriverPipeline(this.getArguments(), path, parallelArgv);

      await pipeline.run();
    }
  }

  const command = new RunExplicitDriver();

  // Register sub-commands for the driver
  driver.commands.forEach(({ path: subpath, config, runner }) => {
    command.register<{}, []>(
      `${path}:${subpath}`,
      { ...config, category: 'driver' },
      (options, params, rest) => runner(tool, options, params, rest),
    );
  });

  return command;
}
