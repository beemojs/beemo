import { ScriptContextOptions, ScriptContextParams } from '@beemo/core';
import { Arg, Command, Config, GlobalOptions } from '@boost/cli';
import { beemo } from '../beemo';

@Config('run-script', beemo.msg('app:cliCommandRunScript'), {
  aliases: ['run'],
  allowVariadicParams: true,
  category: 'core',
})
export default class RunScript extends Command<
  GlobalOptions & ScriptContextOptions,
  ScriptContextParams
> {
  @Arg.Number(beemo.msg('app:cliOptionConcurrency'))
  concurrency: number = 0;

  @Arg.Flag(beemo.msg('app:cliOptionGraph'))
  graph: boolean = false;

  @Arg.String(beemo.msg('app:cliOptionStdio'), { choices: ['buffer', 'stream', 'inherit'] })
  stdio: string = 'buffer';

  @Arg.String(beemo.msg('app:cliOptionWorkspaces'))
  workspaces: string = '';

  @Arg.Params<ScriptContextParams>({
    description: beemo.msg('app:cliArgScriptName'),
    label: 'name',
    required: true,
    type: 'string',
  })
  async run(name: string) {
    const pipeline = beemo.createRunScriptPipeline(this.getArguments(), name);

    await pipeline.run();
  }
}
