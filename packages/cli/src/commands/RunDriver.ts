import {
  Arg,
  Config,
  Command,
  GlobalOptions,
  Argv,
  CommandMetadata,
  ParserOptions,
} from '@boost/cli';
import { Driver, DriverContextOptions } from '@beemo/core';
import { beemo } from '../beemo';

export interface RunDriverConfig {
  driver: Driver;
  parallelArgv: Argv[];
}

@Config('run-driver', beemo.msg('app:cliCommandRunDriver'))
export default class RunDriver extends Command<
  DriverContextOptions & GlobalOptions,
  [],
  RunDriverConfig
> {
  static allowUnknownOptions = true;

  static allowVariadicParams = true;

  @Arg.Number(beemo.msg('app:cliOptionConcurrency'))
  concurrency: number = 0;

  @Arg.Flag(beemo.msg('app:cliOptionGraph'))
  graph: boolean = true;

  @Arg.String(beemo.msg('app:cliOptionStdio'), { choices: ['buffer', 'stream', 'inherit'] })
  stdio: string = 'buffer';

  @Arg.String(beemo.msg('app:cliOptionWorkspaces'))
  workspaces: string = '';

  getMetadata(): CommandMetadata {
    const { driver } = this.options;

    return {
      ...super.getMetadata(),
      description:
        driver.metadata.description || beemo.msg('app:run', { title: driver.metadata.title }),
      path: driver.name,
    };
  }

  getParserOptions(): ParserOptions<DriverContextOptions & GlobalOptions> {
    const { driver } = this.options;
    const parent = super.getParserOptions();

    return {
      ...parent,
      options: {
        ...parent.options,
        ...driver.command,
      },
    };
  }

  async run() {
    const pipeline = beemo.createRunDriverPipeline(this.getArguments(), this.options.driver.name);

    await pipeline.run();
  }
}
