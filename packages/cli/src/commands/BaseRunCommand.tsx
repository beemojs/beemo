/* eslint-disable no-console */

import React from 'react';
import { DriverContext } from '@beemo/core';
import { Arg, Command, GlobalOptions, PrimitiveType } from '@boost/cli';
import { SerialPipeline } from '@boost/pipeline';
import { tool } from '../setup';

export abstract class BaseRunCommand<
	O extends object,
	P extends PrimitiveType[],
	C extends object = {},
> extends Command<GlobalOptions & O, P, C> {
	@Arg.Number(tool.msg('app:cliOptionConcurrency'))
	concurrency: number = 0;

	@Arg.Flag(tool.msg('app:cliOptionGraph'))
	graph: boolean = false;

	@Arg.String(tool.msg('app:cliOptionWorkspaces'))
	workspaces: string = '';

	async renderDriver(pipeline: SerialPipeline<{}, DriverContext, unknown, unknown>) {
		const { App } = await import('../components/App');
		const driver = pipeline.context.primaryDriver;
		let hasError = false;

		try {
			await this.render(<App outputStrategy={driver.getOutputStrategy()} pipeline={pipeline} />);
		} catch (error: unknown) {
			hasError = true;
			throw error;
		} finally {
			if (
				driver.getOutputStrategy() === 'buffer' ||
				(driver.getOutputStrategy() === 'none' && hasError)
			) {
				if (driver.output.stdout) {
					console.log(driver.output.stdout);
				}

				if (driver.output.stderr) {
					console.error(driver.output.stderr);
				}
			}
		}
	}
}
