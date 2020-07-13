import { Config, Command, GlobalOptions } from '@boost/cli';
import beemo from '../beemo';

@Config('create-config', beemo.msg('app:cliCommandConfig'))
export default class CreateConfig extends Command<GlobalOptions> {
  static aliases = ['config'];

  static allowVariadicParams = 'names';

  async run(...names: string[]) {
    const pipeline = beemo.createConfigurePipeline(this.getArguments(), names);

    await pipeline.run();
  }
}
