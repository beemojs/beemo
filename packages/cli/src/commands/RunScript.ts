import { ScriptContextOptions, ScriptContextParams } from '@beemo/core';
import { Arg, Command, Config, GlobalOptions } from '@boost/cli';
import { tool } from '../setup';

@Config('run-script', tool.msg('app:cliCommandRunScript'), {
  aliases: ['run'],
  allowUnknownOptions: true,
  allowVariadicParams: true,
  category: 'core',
})
export default class RunScript extends Command<
  GlobalOptions & ScriptContextOptions,
  ScriptContextParams
> {
  @Arg.Number(tool.msg('app:cliOptionConcurrency'))
  concurrency: number = 0;

  @Arg.Flag(tool.msg('app:cliOptionGraph'))
  graph: boolean = false;

  @Arg.String(tool.msg('app:cliOptionStdio'), { choices: ['buffer', 'stream', 'inherit'] })
  stdio: string = 'buffer';

  @Arg.String(tool.msg('app:cliOptionWorkspaces'))
  workspaces: string = '';

  @Arg.Params<ScriptContextParams>({
    description: tool.msg('app:cliArgScriptName'),
    label: 'name',
    required: true,
    type: 'string',
  })
  async run(name: string) {
    const pipeline = tool.createRunScriptPipeline(this.getArguments(), name);

    await pipeline.run();
  }
}
