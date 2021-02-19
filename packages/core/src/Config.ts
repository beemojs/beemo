import { Blueprint, Predicates } from '@boost/common';
import { Configuration, createPluginsPredicate } from '@boost/config';
import { ConfigFile } from './types';

export default class Config extends Configuration<ConfigFile> {
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
      }),
      module: onConstruction ? moduleSchema : moduleSchema.required(),
      scripts: createPluginsPredicate(predicates),
      settings: object(),
    };
  }
}
