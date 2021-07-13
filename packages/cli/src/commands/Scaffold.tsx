import React from 'react';
import { ScaffoldContextOptions, ScaffoldContextParams } from '@beemo/core';
import { Arg, Command, Config, GlobalOptions } from '@boost/cli';
import { App } from '../components/App';
import { tool } from '../setup';

@Config('scaffold', tool.msg('app:cliCommandScaffold'), { category: 'core' })
export class Scaffold extends Command<
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
	run(generator: string, action: string, name: string = '') {
		const pipeline = tool.createScaffoldPipeline(this.getArguments(), generator, action, name);

		return <App pipeline={pipeline} />;
	}
}
