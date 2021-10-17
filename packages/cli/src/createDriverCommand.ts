/* eslint-disable max-classes-per-file */

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

			return this.renderDriver(pipeline);
		}
	}

	const command = new RunExplicitDriver();

	// Register sub-commands for the driver
	driver.commands.forEach(({ path: subpath, config, runner }) => {
		@Config(`${path}:${subpath}`, config.description, { ...config, category: 'driver' })
		class DriverSubCommand extends BaseRunCommand<{}, [], {}> {
			async run() {
				const args = this.getArguments();

				return runner(tool, args.options, args.params, args.rest);
			}
		}

		command.register(new DriverSubCommand());
	});

	return command;
}
