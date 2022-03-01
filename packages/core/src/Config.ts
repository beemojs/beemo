import { Blueprint, Schemas } from '@boost/common';
import { Configuration, createPluginsSchema, mergePlugins } from '@boost/config';
import { STRATEGY_BUFFER, STRATEGY_NONE, STRATEGY_PIPE, STRATEGY_STREAM } from './constants';
import { ConfigExecuteStrategy, ConfigFile } from './types';

export class Config extends Configuration<ConfigFile> {
	blueprint(schemas: Schemas, onConstruction: boolean): Blueprint<ConfigFile> {
		const { bool, number, object, shape, string } = schemas;
		const moduleSchema = string(process.env.BEEMO_CONFIG_MODULE);

		return {
			configure: shape({
				cleanup: bool(false),
				parallel: bool(true),
			}),
			debug: bool(),
			drivers: createPluginsSchema(schemas),
			execute: shape({
				concurrency: number(3).gt(0),
				graph: bool(true),
				output: string().oneOf<ConfigExecuteStrategy>([
					'',
					STRATEGY_BUFFER,
					STRATEGY_PIPE,
					STRATEGY_STREAM,
					STRATEGY_NONE,
				]),
			}),
			module: onConstruction ? moduleSchema : moduleSchema.required().notEmpty(),
			scripts: createPluginsSchema(schemas),
			settings: object(),
		};
	}

	override bootstrap() {
		this.configureFinder({ errorIfNoRootFound: true });
		this.addProcessHandler('drivers', mergePlugins);
		this.addProcessHandler('scripts', mergePlugins);
	}
}
