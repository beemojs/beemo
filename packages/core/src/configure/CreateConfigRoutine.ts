/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import merge from 'lodash/merge';
import optimal, { instance, Struct } from 'optimal';
import { ConfigLoader, Routine } from 'boost';
import parseArgs from 'yargs-parser';
import Driver from '../Driver';
import { Arguments, DriverContext } from '../types';

export interface CreateConfigOptions extends Struct {
  driver: Driver<any>;
}

export default class CreateConfigRoutine extends Routine<CreateConfigOptions, DriverContext> {
  bootstrap() {
    this.options = optimal(
      this.options,
      {
        driver: instance(Driver).required(),
      },
      {
        name: 'CreateConfigRoutine',
      },
    );
  }

  execute(): Promise<string> {
    const { name } = this.options.driver;

    this.task(`Loading external ${name} module config`, this.loadConfigFromFilesystem);
    this.task(`Loading local ${name} Beemo config`, this.extractConfigFromPackage);
    this.task(`Merging ${name} config objects`, this.mergeConfigs);
    this.task(`Creating temporary ${name} config file`, this.createConfigFile);

    return this.serializeTasks([]);
  }

  /**
   * Create a temporary configuration file or pass as an option.
   */
  createConfigFile(context: DriverContext, config: object): Promise<string> {
    const { metadata } = this.options.driver;
    const configPath = path.join(context.root, metadata.configName);

    this.debug('Creating config file %s', chalk.cyan(configPath));

    this.options.driver.config = config as any;

    context.configPaths.push(configPath);

    this.tool.emit('create-config-file', [configPath, config]);

    return fs
      .writeFile(configPath, this.options.driver.formatConfig(config))
      .then(() => configPath);
  }

  /**
   * Extract configuration from "beemo.<driver>" within the local project's package.json.
   */
  extractConfigFromPackage(context: DriverContext, prevConfigs: Struct[]): Promise<Struct[]> {
    const { name } = this.options.driver;
    const { config } = this.tool;
    const configs = [...prevConfigs];

    this.debug.invariant(
      !!config[name],
      `Extracting ${chalk.magenta(name)} config from package.json "beemo" property`,
      'Exists, extracting',
      'Does not exist, skipping',
    );

    if (config[name]) {
      const pkgConfig = config[name];

      configs.push(pkgConfig);

      this.tool.emit('load-package-config', [pkgConfig]);
    }

    return Promise.resolve(configs);
  }

  /**
   * Merge multiple configuration sources using the current driver.
   */
  mergeConfigs(context: DriverContext, configs: Struct[]): Promise<Struct> {
    this.debug(
      'Merging %s config from %d sources',
      chalk.magenta(this.options.driver.name),
      configs.length,
    );

    const config = configs.reduce(
      (masterConfig, cfg) => this.options.driver.mergeConfig(masterConfig, cfg),
      {},
    );

    this.tool.emit('merge-config', [config]);

    return Promise.resolve(config);
  }

  /**
   * Load configuration from the node module (the consumer owned package).
   */
  loadConfigFromFilesystem(context: DriverContext, prevConfigs: Struct[]): Promise<Struct[]> {
    const {
      config: { module: moduleName },
    } = this.tool;
    const { name } = this.options.driver;
    const configLoader = new ConfigLoader(this.tool);
    const configs = [...prevConfigs];

    // Allow for local development
    const filePath =
      moduleName === '@local'
        ? path.join(context.workspaceRoot || context.root, `configs/${name}.js`)
        : configLoader.resolveModuleConfigPath(name, moduleName);
    const fileExists = fs.existsSync(filePath);

    this.debug.invariant(
      fileExists,
      `Loading ${chalk.magenta(name)} config from configuration module ${chalk.yellow(moduleName)}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    if (fileExists) {
      const args = merge({}, context.args, parseArgs(this.options.driver.getArgs()));
      const config = configLoader.parseFile(filePath, [args, this.tool]);

      this.tool.emit('load-module-config', [filePath, config]);

      configs.push(config);
    }

    return Promise.resolve(configs);
  }
}
