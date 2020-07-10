import { Arg, Config, Command, GlobalOptions } from '@boost/cli';
import { StdioType } from '@beemo/core';
import beemo from '../beemo';

export interface RunScriptOptions extends GlobalOptions {
  concurrency: number;
  graph: boolean;
  stdio: StdioType;
  workspaces: string;
}

export type RunScriptParams = [string];

@Config('run-script', beemo.msg('app:cliCommandRunScript'))
export default class RunScript extends Command<RunScriptOptions, RunScriptParams> {
  static aliases = ['run'];

  @Arg.Number(beemo.msg('app:cliOptionConcurrency'))
  concurrency: number = 0;

  @Arg.Flag(beemo.msg('app:cliOptionGraph'))
  graph: boolean = false;

  @Arg.String(beemo.msg('app:cliOptionStdio'), { choices: ['buffer', 'stream', 'inherit'] })
  stdio: string = 'buffer';

  @Arg.String(beemo.msg('app:cliOptionWorkspaces'))
  workspaces: string = '';

  @Arg.Params<RunScriptParams>({
    description: beemo.msg('app:cliArgScriptName'),
    label: 'name',
    required: true,
    type: 'string',
  })
  async run(name: string) {}
}
