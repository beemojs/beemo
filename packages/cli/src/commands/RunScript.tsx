import React from 'react';
import { ScriptContextOptions, ScriptContextParams } from '@beemo/core';
import { Arg, Config } from '@boost/cli';
import { App } from '../components/App';
import { tool } from '../setup';
import { BaseRunCommand } from './BaseRunCommand';

@Config('run-script', tool.msg('app:cliCommandRunScript'), {
	aliases: ['run'],
	allowUnknownOptions: true,
	allowVariadicParams: true,
	category: 'core',
})
export class RunScript extends BaseRunCommand<ScriptContextOptions, ScriptContextParams> {
	@Arg.Params<ScriptContextParams>({
		description: tool.msg('app:cliArgScriptName'),
		label: 'name',
		required: true,
		type: 'string',
	})
	run(name: string) {
		const pipeline = tool.createRunScriptPipeline(this.getArguments(), name);

		return <App pipeline={pipeline} />;
	}
}
