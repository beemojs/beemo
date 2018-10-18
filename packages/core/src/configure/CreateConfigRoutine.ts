/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import optimal, { instance, Struct } from 'optimal';
import { ConfigLoader, Routine } from '@boost/core';
import Driver from '../Driver';
import DriverContext from '../contexts/DriverContext';
import { STRATEGY_COPY, STRATEGY_REFERENCE, STRATEGY_CREATE, STRATEGY_NATIVE } from '../constants';
import { BeemoTool } from '../types';

export interface CreateConfigOptions {
  driver: Driver;
}

export default class CreateConfigRoutine extends Routine<
  DriverContext,
  BeemoTool,
  CreateConfigOptions
> {
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

  async execute(): Promise<string> {
    const { tool } = this;
    const { metadata, name, options } = this.options.driver;
    const strategy =
      options.strategy === STRATEGY_NATIVE ? metadata.configStrategy : options.strategy;

    this.task(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars);

    switch (strategy) {
      case STRATEGY_REFERENCE:
        this.task(tool.msg('app:configReference', { name }), this.referenceConfigFile);
        break;

      case STRATEGY_COPY:
        this.task(tool.msg('app:configCopy', { name }), this.copyConfigFile);
        break;

      case STRATEGY_CREATE:
        this.task(tool.msg('app:configCreateLoadFile', { name }), this.loadConfigFromSources);
        this.task(tool.msg('app:configCreateLoadPackage', { name }), this.extractConfigFromPackage);
        this.task(tool.msg('app:configCreateMerge', { name }), this.mergeConfigs);
        this.task(tool.msg('app:configCreate', { name }), this.createConfigFile);
        break;

      default:
        this.skip(true);
        break;
    }

    return this.serializeTasks([]);
  }

  /**
   * Copy configuration file from module.
   */
  async copyConfigFile(context: DriverContext): Promise<string> {
    const { metadata, name } = this.options.driver;
    const configLoader = new ConfigLoader(this.tool);
    const sourcePath = this.getConfigPath(configLoader);
    const configPath = path.join(context.root, metadata.configName);

    if (!sourcePath) {
      throw new Error(this.tool.msg('errors:configCopySourceMissing'));
    }

    const config = this.loadConfig(configLoader, sourcePath);

    this.debug('Copying config file to %s', chalk.cyan(configPath));

    this.options.driver.config = config;

    context.addConfigPath(name, configPath);

    this.tool.emit(`${name}.copy-config-file`, [configPath, config]);

    return fs
      .copy(sourcePath, configPath, {
        overwrite: true,
      })
      .then(() => configPath);
  }

  /**
   * Create a temporary configuration file or pass as an option.
   */
  async createConfigFile(context: DriverContext, config: object): Promise<string> {
    const { metadata, name } = this.options.driver;
    const configPath = path.join(context.root, metadata.configName);

    this.debug('Creating config file %s', chalk.cyan(configPath));

    this.options.driver.config = config as any;

    context.addConfigPath(name, configPath);

    this.tool.emit(`${name}.create-config-file`, [configPath, config]);

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

      this.tool.emit(`${name}.load-package-config`, [pkgConfig]);
    }

    return Promise.resolve(configs);
  }

  /**
   * Return absolute file path for config file within configuration module,
   * or an empty string if it does not exist.
   */
  getConfigPath(configLoader: ConfigLoader, forceLocal: boolean = false): string {
    const { root, workspaceRoot } = this.context;
    const moduleName = this.tool.config.module;
    const { name } = this.options.driver;
    const isLocal = moduleName === '@local' || forceLocal;

    // Allow for local development
    const filePath = isLocal
      ? path.join(workspaceRoot || root, `configs/${name}.js`)
      : configLoader.resolveModuleConfigPath(name, moduleName);
    const fileExists = fs.existsSync(filePath);

    this.debug.invariant(
      fileExists,
      isLocal
        ? `Loading ${chalk.magenta(name)} config from local consumer`
        : `Loading ${chalk.magenta(name)} config from configuration module ${chalk.yellow(
            moduleName,
          )}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    return fileExists ? filePath : '';
  }

  /**
   * Merge multiple configuration sources using the current driver.
   */
  mergeConfigs(context: DriverContext, configs: Struct[]): Promise<Struct> {
    const { name } = this.options.driver;

    this.debug('Merging %s config from %d sources', chalk.magenta(name), configs.length);

    const config = configs.reduce(
      (masterConfig, cfg) => this.options.driver.mergeConfig(masterConfig, cfg),
      {},
    );

    this.tool.emit(`${name}.merge-config`, [config]);

    return Promise.resolve(config);
  }

  /**
   * Load a config file with passing the args and tool to the file.
   */
  loadConfig(configLoader: ConfigLoader, filePath: string): Struct {
    const config = configLoader.parseFile(filePath, [], { errorOnFunction: true });

    this.tool.emit(`${this.options.driver.name}.load-module-config`, [filePath, config]);

    return config;
  }

  /**
   * Load config from the provider configuration module
   * and from the local configs/ folder in the consumer.
   */
  loadConfigFromSources(context: DriverContext, prevConfigs: Struct[]): Promise<Struct[]> {
    const configLoader = new ConfigLoader(this.tool);
    const modulePath = this.getConfigPath(configLoader);
    const localPath = this.getConfigPath(configLoader, true);
    const configs = [...prevConfigs];

    if (modulePath) {
      configs.push(this.loadConfig(configLoader, modulePath));
    }

    // Local files should override anything defined in the configuration module above
    // Also don't double load files, so check against @local to avoid
    if (localPath && localPath !== modulePath) {
      configs.push(this.loadConfig(configLoader, localPath));
    }

    return Promise.resolve(configs);
  }

  /**
   * Reference configuration file from module using a require statement.
   */
  referenceConfigFile(context: DriverContext): Promise<string> {
    const { metadata, name } = this.options.driver;
    const configLoader = new ConfigLoader(this.tool);
    const sourcePath = this.getConfigPath(configLoader);
    const configPath = path.join(context.root, metadata.configName);

    if (!sourcePath) {
      throw new Error(this.tool.msg('errors:configReferenceSourceMissing'));
    }

    const config = this.loadConfig(configLoader, sourcePath);

    this.debug('Referencing config file to %s', chalk.cyan(configPath));

    this.options.driver.config = config;

    context.addConfigPath(name, configPath);

    this.tool.emit(`${name}.reference-config-file`, [configPath, config]);

    return fs
      .writeFile(
        configPath,
        `module.exports = require('./${path.relative(context.root, sourcePath)}');`,
      )
      .then(() => configPath);
  }

  /**
   * Set environment variables defined by the driver.
   */
  setEnvVars(context: DriverContext, configs: Struct[]): Promise<any> {
    const { env } = this.options.driver.options;

    // TODO: This may cause collisions, isolate in a child process?
    Object.keys(env).forEach(key => {
      process.env[key] = env[key];
    });

    return Promise.resolve(configs);
  }
}
