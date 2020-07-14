import chalk from 'chalk';
import fs from 'fs-extra';
import camelCase from 'lodash/camelCase';
import { Path, PathResolver, Predicates, requireModule, Blueprint, Bind } from '@boost/common';
import { Routine } from '@boost/pipeline';
import Tool from '../Tool';
import Driver from '../Driver';
import ConfigContext from '../contexts/ConfigContext';
import { STRATEGY_COPY, STRATEGY_REFERENCE, STRATEGY_CREATE, STRATEGY_NATIVE } from '../constants';
import { RoutineOptions } from '../types';

export interface ConfigObject {
  [key: string]: unknown;
}

export interface CreateConfigOptions extends RoutineOptions {
  driver: Driver;
}

export default class CreateConfigRoutine<Ctx extends ConfigContext> extends Routine<
  Path,
  unknown,
  CreateConfigOptions
> {
  blueprint({ instance }: Predicates): Blueprint<CreateConfigOptions> {
    return {
      // @ts-ignore Errors because Driver is abstract
      driver: instance(Driver).required().notNullable(),
      tool: instance(Tool).required().notNullable(),
    };
  }

  execute(context: Ctx): Promise<Path> {
    const { driver, tool } = this.options;
    const { metadata, options } = driver;
    const name = metadata.title;
    const strategy =
      options.strategy === STRATEGY_NATIVE ? metadata.configStrategy : options.strategy;

    switch (strategy) {
      case STRATEGY_REFERENCE:
        return this.createWaterfallPipeline(context, [])
          .pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
          .pipe(tool.msg('app:configReference', { name }), this.referenceConfigFile)
          .run();

      case STRATEGY_COPY:
        return this.createWaterfallPipeline(context, [])
          .pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
          .pipe(tool.msg('app:configCopy', { name }), this.copyConfigFile)
          .run();

      case STRATEGY_CREATE:
        return this.createWaterfallPipeline(context, [])
          .pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
          .pipe(tool.msg('app:configCreateLoadFile', { name }), this.loadConfigFromSources)
          .pipe(tool.msg('app:configCreateMerge', { name }), this.mergeConfigs)
          .pipe(tool.msg('app:configCreate', { name }), this.createConfigFile)
          .run();

      default:
        this.skip(true);
        break;
    }

    return Promise.resolve(new Path());
  }

  /**
   * Copy configuration file from module.
   */
  @Bind()
  async copyConfigFile(context: Ctx): Promise<Path> {
    const { driver, tool } = this.options;
    const { metadata, name } = driver;
    const sourcePath = this.getConfigPath(context);
    const configPath = context.cwd.append(metadata.configName);

    if (!sourcePath) {
      throw new Error(tool.msg('errors:configCopySourceMissing'));
    }

    const config = this.loadConfig(context, sourcePath);

    this.debug('Copying config file to %s', chalk.cyan(configPath));

    driver.config = config;
    driver.onCopyConfigFile.emit([context, configPath, config]);

    context.addConfigPath(name, configPath);

    await fs.copy(sourcePath.path(), configPath.path(), {
      overwrite: true,
    });

    return configPath;
  }

  /**
   * Create a temporary configuration file or pass as an option.
   */
  @Bind()
  async createConfigFile(context: Ctx, config: ConfigObject): Promise<Path> {
    const { driver } = this.options;
    const { metadata, name } = driver;
    const configPath = context.cwd.append(metadata.configName);

    this.debug('Creating config file %s', chalk.cyan(configPath));

    driver.config = config;
    driver.onCreateConfigFile.emit([context, configPath, config]);

    context.addConfigPath(name, configPath);

    await fs.writeFile(configPath.path(), this.options.driver.formatConfig(config));

    return configPath;
  }

  /**
   * Return file name camel cased.
   */
  getConfigName(name: string): string {
    return camelCase(name);
  }

  /**
   * Return absolute file path for config file within configuration module,
   * or an empty string if it does not exist.
   */
  getConfigPath({ cwd, workspaceRoot }: Ctx, forceLocal: boolean = false): Path | null {
    const moduleName = this.options.tool.config.module;
    const { name } = this.options.driver;
    const configName = this.getConfigName(name);
    const isLocal = moduleName === '@local' || forceLocal;
    const resolver = new PathResolver();

    // Allow for local development
    if (isLocal) {
      resolver
        .lookupFilePath(`lib/configs/${configName}.js`, workspaceRoot || cwd)
        .lookupFilePath(`configs/${configName}.js`, workspaceRoot || cwd);
    } else {
      resolver
        .lookupNodeModule(`${moduleName}/lib/configs/${configName}`)
        .lookupNodeModule(`${moduleName}/configs/${configName}`);
    }

    let configPath = null;

    try {
      configPath = resolver.resolvePath();
    } catch {
      // Ignore
    }

    this.debug.invariant(
      !!configPath,
      isLocal
        ? `Loading ${chalk.green(name)} config from local consumer`
        : `Loading ${chalk.green(name)} config from configuration module ${chalk.yellow(
            moduleName,
          )}`,
      'Exists, loading',
      'Does not exist, skipping',
    );

    if (configPath) {
      this.debug('Found at %s', chalk.cyan(configPath));
    }

    return configPath;
  }

  /**
   * Merge multiple configuration sources using the current driver.
   */
  @Bind()
  mergeConfigs(context: Ctx, configs: ConfigObject[]): Promise<ConfigObject> {
    const { driver } = this.options;
    const { name } = driver;

    this.debug('Merging %s config from %d sources', chalk.green(name), configs.length);

    const config = configs.reduce(
      (masterConfig, cfg) => this.options.driver.mergeConfig(masterConfig, cfg),
      {},
    );

    driver.onMergeConfig.emit([context, config]);

    return Promise.resolve(config);
  }

  /**
   * Load a config file with passing the args and tool to the file.
   */
  loadConfig(context: Ctx, filePath: Path): ConfigObject {
    const config: ConfigObject = requireModule(filePath);

    if (typeof config === 'function') {
      throw new TypeError(
        this.options.tool.msg('errors:configNoFunction', { name: filePath.name() }),
      );
    }

    this.options.driver.onLoadModuleConfig.emit([context, filePath, config]);

    return config;
  }

  /**
   * Load config from the provider configuration module
   * and from the local configs/ folder in the consumer.
   */
  @Bind()
  loadConfigFromSources(context: Ctx, prevConfigs: ConfigObject[]): Promise<ConfigObject[]> {
    const sourcePath = this.getConfigPath(context);
    const localPath = this.getConfigPath(context, true);
    const configs = [...prevConfigs];

    if (sourcePath) {
      configs.push(this.loadConfig(context, sourcePath));
    }

    // Local files should override anything defined in the configuration module above
    // Also don't double load files, so check against @local to avoid
    if (localPath && sourcePath && localPath.path() !== sourcePath.path()) {
      configs.push(this.loadConfig(context, localPath));
    }

    return Promise.resolve(configs);
  }

  /**
   * Reference configuration file from module using a require statement.
   */
  @Bind()
  async referenceConfigFile(context: Ctx): Promise<Path> {
    const { driver, tool } = this.options;
    const { metadata, name } = driver;
    const sourcePath = this.getConfigPath(context);
    const configPath = context.cwd.append(metadata.configName);

    if (!sourcePath) {
      throw new Error(tool.msg('errors:configReferenceSourceMissing'));
    }

    const config = this.loadConfig(context, sourcePath);

    this.debug('Referencing config file to %s', chalk.cyan(configPath));

    driver.config = config;
    driver.onReferenceConfigFile.emit([context, configPath, config]);

    context.addConfigPath(name, configPath);

    const requirePath = context.cwd.relativeTo(sourcePath);

    await fs.writeFile(configPath.path(), `module.exports = require('./${requirePath}');`);

    return configPath;
  }

  /**
   * Set environment variables defined by the driver.
   */
  @Bind()
  setEnvVars(context: Ctx, configs: ConfigObject[]): Promise<ConfigObject[]> {
    const { env } = this.options.driver.options;

    // TODO: This may cause collisions, isolate somehow?
    Object.keys(env).forEach((key) => {
      process.env[key] = env[key];
    });

    return Promise.resolve(configs);
  }
}
