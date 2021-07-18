import React from 'react';
import { Command, Config, GlobalOptions } from '@boost/cli';
import { tool } from '../setup';

@Config('create-config', tool.msg('app:cliCommandConfig'), {
	aliases: ['config'],
	allowVariadicParams: 'names',
	category: 'core',
})
export class CreateConfig extends Command<GlobalOptions> {
	async run(...names: string[]) {
		const { App } = await import('../components/App');
		const pipeline = tool.createConfigurePipeline(this.getArguments(), names);

		// @ts-expect-error Event type mismatch
		return <App pipeline={pipeline} />;
	}
}
