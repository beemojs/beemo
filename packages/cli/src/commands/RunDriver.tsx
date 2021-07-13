import React from 'react';
import { Blueprint, DriverContextOptions, DriverContextParams, Predicates } from '@beemo/core';
import { Arg, Argv, Config } from '@boost/cli';
import { App } from '../components/App';
import { tool } from '../setup';
import { BaseRunCommand } from './BaseRunCommand';

export interface RunDriverConfig {
	parallelArgv?: Argv[];
}

@Config('run-driver', tool.msg('app:cliCommandRunDriver'), {
	allowUnknownOptions: true,
	allowVariadicParams: true,
	category: 'core',
})
export class RunDriver extends BaseRunCommand<DriverContextOptions, [], RunDriverConfig> {
	@Arg.Params<DriverContextParams>({
		description: tool.msg('app:cliArgDriverName'),
		label: 'name',
		required: true,
		type: 'string',
	})
	run(name: string = '') {
		const pipeline = tool.createRunDriverPipeline(
			this.getArguments(),
			name,
			this.options.parallelArgv,
		);

		return (
			<App
				outputStrategy={pipeline.context.primaryDriver.getOutputStrategy()}
				pipeline={pipeline}
			/>
		);
	}

	override blueprint({ array, string }: Predicates): Blueprint<RunDriverConfig> {
		return {
			parallelArgv: array(array(string())),
		};
	}
}
