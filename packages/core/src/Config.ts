import { Blueprint, Predicates } from '@boost/common';
import { Configuration, createPluginsPredicate, mergePlugins } from '@boost/config';
// import { STRATEGY_BUFFER, STRATEGY_NONE, STRATEGY_PIPE, STRATEGY_STREAM } from './constants';
import { ConfigExecuteStrategy, ConfigFile } from './types';

export class Config extends Configuration<ConfigFile> {
	blueprint(predicates: Predicates, onConstruction: boolean): Blueprint<ConfigFile> {
		const { bool, number, object, shape, string } = predicates;
		const moduleSchema = string(process.env.BEEMO_CONFIG_MODULE);

		return {
			configure: shape({
				cleanup: bool(false),
				parallel: bool(true),
			}),
			debug: bool(),
			drivers: createPluginsPredicate(predicates),
			execute: shape({
				concurrency: number(3).gt(0),
				graph: bool(true),
				output: string<ConfigExecuteStrategy>() /* .oneOf<ConfigExecuteStrategy>([
          '',
          STRATEGY_BUFFER,
          STRATEGY_PIPE,
          STRATEGY_STREAM,
          STRATEGY_NONE,
        ]), */,
			}),
			module: onConstruction ? moduleSchema : moduleSchema.required(),
			scripts: createPluginsPredicate(predicates),
			settings: object(),
		};
	}

	override bootstrap() {
		this.addProcessHandler('drivers', mergePlugins);
		this.addProcessHandler('scripts', mergePlugins);
	}
}
