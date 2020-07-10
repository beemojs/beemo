import { Arg, Config, Command, GlobalOptions } from '@boost/cli';
import beemo from '../beemo';

export interface ScaffoldOptions extends GlobalOptions {
  dry: boolean;
}

export type ScaffoldParams = [string, string, string];

@Config('scaffold', beemo.msg('app:cliCommandScaffold'))
export default class Scaffold extends Command<ScaffoldOptions, ScaffoldParams> {
  @Arg.Flag(beemo.msg('app:cliOptionDryRun'))
  dry: boolean = false;

  @Arg.Params<ScaffoldParams>(
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
      required: true,
      type: 'string',
    },
  )
  async run(generator: string, action: string, name: string) {}
}
