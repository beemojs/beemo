import { Arg, Config, Command, GlobalOptions, Argv } from '@boost/cli';
import { Driver, StdioType } from '@beemo/core';
import beemo from '../beemo';

export interface RunDriverConfig {
  driver: Driver;
  parallelArgv: Argv[];
}

export interface RunDriverOptions extends GlobalOptions {
  concurrency: number;
  graph: boolean;
  stdio: StdioType;
  workspaces: string;
}

export type RunDriverParams = [];

@Config('run-driver', beemo.msg('app:cliCommandRunDriver'))
export default class RunDriver extends Command<RunDriverOptions, RunDriverParams, RunDriverConfig> {
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

  constructor(options: RunDriverConfig) {
    super(options);

    // Add custom options to the command
    Object.entries(this.options.driver.command).forEach(([opt, config]) => {
      // TODO
    });
  }

  getMetadata() {
    const { driver } = this.options;

    return {
      ...super.getMetadata(),
      description:
        driver.metadata.description || beemo.msg('app:run', { title: driver.metadata.title }),
      name: driver.name,
    };
  }

  async run() {}
}
