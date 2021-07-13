import { Driver, DriverContextOptions } from '@beemo/core';
import { Argv, Config, GlobalOptions, ParserOptions } from '@boost/cli';
import { BaseRunCommand } from './commands/BaseRunCommand';
import { tool } from './setup';

export function createDriverCommand(
	driver: Driver,
	parallelArgv?: Argv[],
): BaseRunCommand<DriverContextOptions, []> {
	const path = driver.getName();

	@Config(
		path,
		driver.metadata.description || tool.msg('app:run', { title: driver.metadata.title }),
		{
			allowUnknownOptions: true,
			allowVariadicParams: true,
			category: 'driver',
		},
	)
	class RunExplicitDriver extends BaseRunCommand<DriverContextOptions, []> {
		override getParserOptions(): ParserOptions<DriverContextOptions & GlobalOptions> {
			const parent = super.getParserOptions();

			return {
				...parent,
				loose: true,
				options: {
					...parent.options,
					...driver.metadata.commandOptions,
				},
			};
		}

		async run() {
			const pipeline = tool.createRunDriverPipeline(this.getArguments(), path, parallelArgv);

			await void this.renderDriver(pipeline);
		}
	}

	const command = new RunExplicitDriver();

	// Register sub-commands for the driver
	driver.commands.forEach(({ path: subpath, config, runner }) => {
		command.register<{}, []>(
			`${path}:${subpath}`,
			{ ...config, category: 'driver' },
			(options, params, rest) => runner(tool, options, params, rest),
		);
	});

	return command;
}
