/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs-extra';
import path from 'path';
import parseArgs from 'yargs-parser';
import { Routine } from 'boost';
import Engine from '../Engine';

import type { RocketContext } from '../types';

export default class CreateConfigRoutine extends Routine<Object, RocketContext> {
  engine: Engine;

  /**
   * Create a temporary configuration file or pass as an option.
   */
  createConfigFile(config: Object): Promise<string> {
    const { metadata } = this.engine;
    const configPath = path.join(this.context.root, metadata.configName);

    this.context.configPaths.push(configPath);

    this.tool.emit('create-config', null, [configPath, config]);

    return fs.writeFile(configPath, this.engine.formatFile(config)).then(() => configPath);
  }

  /**
   * Create config by executing tasks in order.
   */
  execute(): Promise<string> {
    const { name } = this.engine;

    this.task(`Loading external ${name} module config`, this.loadConfigFromFilesystem);
    this.task(`Loading local ${name} rocket config`, this.extractConfigFromPackage);
    this.task(`Merging ${name} config objects`, this.mergeConfigs);
    this.task(`Creating temporary ${name} config file`, this.createConfigFile);

    return this.serializeTasks([]);
  }

  /**
   * Extract configuration from "rocket.<engine>" within the local project's package.json.
   */
  extractConfigFromPackage(configs: Object[]): Promise<Object[]> {
    const { name } = this.engine;
    const { config } = this.tool;

    if (config[name]) {
      configs.push(config[name]);
    }

    this.tool.emit('load-package-config', null, [config]);

    return Promise.resolve(configs);
  }

  /**
   * Gather CLI arguments to pass to the configuration file.
   */
  getArgsToPass(): Object {
    return parseArgs([
      ...this.context.args,
      ...this.engine.options.args,
    ].map(value => String(value)));
  }

  /**
   * Merge multiple configuration sources using the current engine.
   */
  mergeConfigs(configs: Object[]): Promise<Object> {
    const config = Promise.resolve(configs.reduce((masterConfig, config) => (
      this.engine.mergeConfig(masterConfig, config)
    ), {}));

    this.tool.emit('merge-config', null, [config]);

    return config;
  }

  /**
   * Load configuration from the node module (the consumer owned package).
   */
  loadConfigFromFilesystem(configs: Object[]): Promise<Object[]> {
    const { config: { config: moduleName }, configLoader } = this.tool;
    const { name } = this.engine;

    // Allow for local development
    const filePath = (moduleName === '@local')
      ? path.join(this.context.root, `config/${name}.js`)
      : configLoader.resolveModuleConfigPath(name, moduleName);

    if (fs.existsSync(filePath)) {
      const config = configLoader.parseFile(filePath, this.getArgsToPass());

      this.tool.emit('load-module-config', null, [filePath, config]);

      configs.push(config);
    }

    return Promise.resolve(configs);
  }
}
