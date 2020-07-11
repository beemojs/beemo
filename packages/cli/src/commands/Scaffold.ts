import { Arg, Config, Command, GlobalOptions } from '@boost/cli';
import { ScaffoldContextOptions, ScaffoldContextParams } from '@beemo/core';
import beemo from '../beemo';

@Config('scaffold', beemo.msg('app:cliCommandScaffold'))
export default class Scaffold extends Command<
  ScaffoldContextOptions & GlobalOptions,
  ScaffoldContextParams
> {
  @Arg.Flag(beemo.msg('app:cliOptionDryRun'))
  dry: boolean = false;

  @Arg.Params<ScaffoldContextParams>(
    {
      description: beemo.msg('app:cliArgGenerator'),
      label: 'generator',
      required: true,
      type: 'string',
    },
    {
      description: beemo.msg('app:cliArgGeneratorAction'),
      label: 'action',
      required: true,
      type: 'string',
    },
    {
      description: beemo.msg('app:cliArgGeneratorName'),
      label: 'name',
      type: 'string',
    },
  )
  async run(generator: string, action: string, name: string = '') {
    const pipeline = beemo.createScaffoldPipeline(this.getArguments(), generator, action, name);

    await pipeline.run();
  }
}
