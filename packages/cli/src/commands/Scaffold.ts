import { ScaffoldContextOptions, ScaffoldContextParams } from '@beemo/core';
import { Arg, Command, Config, GlobalOptions } from '@boost/cli';
import { tool } from '../setup';

@Config('scaffold', tool.msg('app:cliCommandScaffold'), { category: 'core' })
export default class Scaffold extends Command<
  GlobalOptions & ScaffoldContextOptions,
  ScaffoldContextParams
> {
  @Arg.Flag(tool.msg('app:cliOptionDryRun'))
  dry: boolean = false;

  @Arg.Params<ScaffoldContextParams>(
    {
      description: tool.msg('app:cliArgGenerator'),
      label: 'generator',
      required: true,
      type: 'string',
    },
    {
      description: tool.msg('app:cliArgGeneratorAction'),
      label: 'action',
      required: true,
      type: 'string',
    },
    {
      description: tool.msg('app:cliArgGeneratorName'),
      label: 'name',
      type: 'string',
    },
  )
  async run(generator: string, action: string, name: string = '') {
    const pipeline = tool.createScaffoldPipeline(this.getArguments(), generator, action, name);

    await pipeline.run();
  }
}
