/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import merge from 'lodash/merge';
import optimal, { instance, Struct } from 'optimal';
import { ConfigLoader, Routine } from '@boost/core';
import parseArgs from 'yargs-parser';
import Driver from '../Driver';
import DriverContext from '../contexts/DriverContext';
import { STRATEGY_COPY, STRATEGY_REFERENCE, STRATEGY_CREATE, STRATEGY_NATIVE } from '../constants';

export interface CreateConfigOptions {
  driver: Driver<any>;
}

export default class CreateConfigRoutine extends Routine<DriverContext, CreateConfigOptions> {
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
    const { metadata, name, options } = this.options.driver;
    const strategy =
      options.strategy === STRATEGY_NATIVE ? metadata.configStrategy : options.strategy;

    switch (strategy) {
      case STRATEGY_REFERENCE:
        this.task(`Referencing ${name} config file`, this.referenceConfigFile);
        break;

      case STRATEGY_COPY:
        this.task(`Copying ${name} config file`, this.copyConfigFile);
        break;

      case STRATEGY_CREATE:
        this.task(`Loading source ${name} module config`, this.loadConfigFromFilesystem);
        this.task(`Loading local ${name} Beemo config`, this.extractConfigFromPackage);
        this.task(`Merging ${name} config objects`, this.mergeConfigs);
        this.task(`Creating ${name} config file`, this.createConfigFile);
        break;

      default:
        this.skip(true);
        break;
    }

    return this.serializeTasks();
  }

  /**
   * Copy configuration file from module.
   */
  copyConfigFile(context: DriverContext): Promise<string> {
    const { metadata } = this.options.driver;
    const configLoader = new ConfigLoader(this.tool);
    const sourcePath = this.getSourceConfigPath(configLoader);
    const configPath = path.join(context.root, metadata.configName);

    if (!sourcePath) {
      throw new Error(
        'Cannot copy configuration file. Source file does not exist in configuration module.',
      );
    }

    const config = configLoader.parseFile(sourcePath);

    this.debug('Copying config file to %s', chalk.cyan(configPath));

    this.options.driver.config = config;

    context.configPaths.push(configPath);

    this.tool.emit('copy-config-file', [configPath, config]);

    return fs
      .copy(sourcePath, configPath, {
        overwrite: true,
      })
      .then(() => configPath);
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
   * Return absolute file path for config file within configuration module,
   * or an empty string if it does not exist.
   */
  getSourceConfigPath(configLoader: ConfigLoader): string {
    const { root, workspaceRoot } = this.context;
    const {
      config: { module: moduleName },
    } = this.tool;
    const { name } = this.options.driver;

    // Allow for local development
    const filePath =
      moduleName === '@local'
        ? path.join(workspaceRoot || root, `configs/${name}.js`)
        : configLoader.resolveModuleConfigPath(name, moduleName);
    const fileExists = fs.existsSync(filePath);

    this.debug.invariant(
      fileExists,
      `Loading ${chalk.magenta(name)} config from configuration module ${chalk.yellow(moduleName)}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    return fileExists ? filePath : '';
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
  loadConfigFromFilesystem(context: DriverContext): Promise<Struct[]> {
    const configLoader = new ConfigLoader(this.tool);
    const filePath = this.getSourceConfigPath(configLoader);
    const configs = [];

    if (filePath) {
      const args = merge({}, context.args, parseArgs(this.options.driver.getArgs()));
      const config = configLoader.parseFile(filePath, [args, this.tool]);

      this.tool.emit('load-module-config', [filePath, config]);

      configs.push(config);
    }

    return Promise.resolve(configs);
  }

  /**
   * Reference configuration file from module using a require statement.
   */
  referenceConfigFile(context: DriverContext): Promise<string> {
    const { metadata } = this.options.driver;
    const configLoader = new ConfigLoader(this.tool);
    const sourcePath = this.getSourceConfigPath(configLoader);
    const configPath = path.join(context.root, metadata.configName);

    if (!sourcePath) {
      throw new Error(
        'Cannot reference configuration file. Source file does not exist in configuration module.',
      );
    }

    const config = configLoader.parseFile(sourcePath);

    this.debug('Referencing config file to %s', chalk.cyan(configPath));

    this.options.driver.config = config;

    context.configPaths.push(configPath);

    this.tool.emit('reference-config-file', [configPath, config]);

    return fs
      .writeFile(
        configPath,
        `module.exports = require('./${path.relative(context.root, sourcePath)}');`,
      )
      .then(() => configPath);
  }
}
