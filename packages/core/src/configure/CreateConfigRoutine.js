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
import Driver from '../Driver';

import type { DriverContext } from '../types';

export default class CreateConfigRoutine extends Routine<Object, DriverContext> {
  driver: Driver;

  execute(): Promise<string> {
    const { name } = this.driver;

    this.task(`Loading external ${name} module config`, this.loadConfigFromFilesystem);
    this.task(`Loading local ${name} Beemo config`, this.extractConfigFromPackage);
    this.task(`Merging ${name} config objects`, this.mergeConfigs);
    this.task(`Creating temporary ${name} config file`, this.createConfigFile);

    return this.serializeTasks([]);
  }

  /**
   * Create a temporary configuration file or pass as an option.
   */
  createConfigFile(config: Object): Promise<string> {
    const { metadata } = this.driver;
    const configPath = path.join(this.context.root, metadata.configName);

    this.tool.debug(`Creating config file ${chalk.cyan(configPath)}`);

    this.context.configPaths.push(configPath);

    this.tool.emit('create-config-file', [configPath, config]);

    return fs.writeFile(configPath, this.driver.formatConfig(config)).then(() => configPath);
  }

  /**
   * Extract configuration from "beemo.<driver>" within the local project's package.json.
   */
  extractConfigFromPackage(configs: Object[]): Promise<Object[]> {
    const { name } = this.driver;
    const { config } = this.tool;

    this.tool.invariant(
      !!config[name],
      `Extracting ${chalk.magenta(name)} config from package.json "beemo" property`,
      'Exists, extracting',
      'Does not exist, skipping',
    );

    if (config[name]) {
      configs.push(config[name]);
    }

    this.tool.emit('load-package-config', [config]);

    return Promise.resolve(configs);
  }

  /**
   * Gather CLI arguments to pass to the configuration file.
   */
  getArgsToPass(): Object {
    this.tool.debug('Gathering arguments to pass to config file');

    return parseArgs(
      [...this.driver.options.args, ...this.context.args].map(value => String(value)),
    );
  }

  /**
   * Merge multiple configuration sources using the current driver.
   */
  mergeConfigs(configs: Object[]): Promise<Object> {
    this.tool.debug(
      `Merging ${chalk.magenta(this.driver.name)} config from ${configs.length} sources`,
    );

    const config = configs.reduce(
      (masterConfig, cfg) => this.driver.mergeConfig(masterConfig, cfg),
      {},
    );

    this.tool.emit('merge-config', [config]);

    return Promise.resolve(config);
  }

  /**
   * Load configuration from the node module (the consumer owned package).
   */
  loadConfigFromFilesystem(configs: Object[]): Promise<Object[]> {
    const { config: { module: moduleName }, configLoader } = this.tool;
    const { name } = this.driver;

    // Allow for local development
    const filePath =
      moduleName === '@local'
        ? path.join(this.context.root, `configs/${name}.js`)
        : configLoader.resolveModuleConfigPath(name, moduleName);
    const fileExists = fs.existsSync(filePath);

    this.tool.invariant(
      fileExists,
      `Loading ${chalk.magenta(name)} config from configuration module ${chalk.yellow(moduleName)}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    if (fileExists) {
      const config = configLoader.parseFile(filePath, this.getArgsToPass());

      this.tool.emit('load-module-config', [filePath, config]);

      configs.push(config);
    }

    return Promise.resolve(configs);
  }
}
