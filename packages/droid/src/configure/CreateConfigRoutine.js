/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import parseArgs from 'yargs-parser';
import { Routine } from 'boost';
import Engine from '../Engine';

import type { DroidContext } from '../types';

export default class CreateConfigRoutine extends Routine<Object, DroidContext> {
  engine: Engine;

  /**
   * Create a temporary configuration file or pass as an option.
   */
  createConfigFile(config: Object): Promise<string> {
    const { metadata } = this.engine;
    const configPath = path.join(this.context.root, metadata.configName);

    this.tool.debug(`Creating config file ${chalk.cyan(configPath)}`);

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
    this.task(`Loading local ${name} Droid config`, this.extractConfigFromPackage);
    this.task(`Merging ${name} config objects`, this.mergeConfigs);
    this.task(`Creating temporary ${name} config file`, this.createConfigFile);

    return this.serializeTasks([]);
  }

  /**
   * Extract configuration from "droid.<engine>" within the local project's package.json.
   */
  extractConfigFromPackage(configs: Object[]): Promise<Object[]> {
    const { name } = this.engine;
    const { config } = this.tool;

    this.tool.invariant(
      !config[name],
      `Extracting ${chalk.magenta(name)} config from package.json "droid" block`,
      'Exists, extracting',
      'Does not exist, skipping',
    );

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
    this.tool.debug('\tGathering arguments to pass to config file');

    const { args } = this.engine.options;

    return parseArgs([
      ...this.context.args,
      ...(Array.isArray(args) ? args : args.split(' ')),
    ].map(value => String(value)));
  }

  /**
   * Merge multiple configuration sources using the current engine.
   */
  mergeConfigs(configs: Object[]): Promise<Object> {
    this.tool.debug(`Merging config from ${configs.length} sources`);

    const config = configs.reduce((masterConfig, cfg) => (
      this.engine.mergeConfig(masterConfig, cfg)
    ), {});

    this.tool.emit('merge-config', null, [config]);

    return Promise.resolve(config);
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
    const fileExists = fs.existsSync(filePath);

    this.tool.invariant(
      fileExists,
      `Loading config from configuration module ${chalk.yellow(moduleName)}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    if (fileExists) {
      const config = configLoader.parseFile(filePath, this.getArgsToPass());

      this.tool.debug(`\tParsing config from ${chalk.cyan(filePath)}`);

      this.tool.emit('load-module-config', null, [filePath, config]);

      configs.push(config);
    }

    return Promise.resolve(configs);
  }
}
