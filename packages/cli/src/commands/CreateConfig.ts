import { Command, Config, GlobalOptions } from '@boost/cli';
import { tool } from '../setup';

@Config('create-config', tool.msg('app:cliCommandConfig'), {
	aliases: ['config'],
	allowVariadicParams: 'names',
	category: 'core',
})
export class CreateConfig extends Command<GlobalOptions> {
	async run(...names: string[]) {
		const pipeline = tool.createConfigurePipeline(this.getArguments(), names);

		await pipeline.run();
	}
}
