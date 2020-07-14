import { Blueprint, Predicates } from '@boost/common';
import { Configuration, createPluginsPredicate } from '@boost/config';
import { ConfigFile } from './types';

export default class Config extends Configuration<ConfigFile> {
  blueprint(predicates: Predicates): Blueprint<ConfigFile> {
    const { bool, number, object, shape, string } = predicates;

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
      module: process.env.BEEMO_CONFIG_MODULE ? string(process.env.BEEMO_CONFIG_MODULE) : string(), // .required(),
      scripts: createPluginsPredicate(predicates),
      settings: object(),
    };
  }
}
