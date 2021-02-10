import { Config, Command, GlobalOptions } from '@boost/cli';
import { beemo } from '../beemo';

@Config('create-config', beemo.msg('app:cliCommandConfig'), {
  aliases: ['config'],
  allowVariadicParams: 'names',
  category: 'core',
})
export default class CreateConfig extends Command<GlobalOptions> {
  async run(...names: string[]) {
    const pipeline = beemo.createConfigurePipeline(this.getArguments(), names);

    await pipeline.run();
  }
}
