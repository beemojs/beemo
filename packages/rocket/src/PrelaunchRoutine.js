/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs';
import path from 'path';
import { Routine } from 'boost';

export default class PrelaunchRoutine extends Routine {
  bootstrap() {
    this
      .task('Loading external module config', this.loadConfigFromFilesystem)
      .task('Loading local rocket config', this.extractConfigFromPackage)
      .task('Merging configs', this.mergeConfigs)
      .task('Creating temporary config file', this.createConfigFile);
  }

  /**
   * Create a temporary configuration file or pass as an option.
   */
  createConfigFile(config: Object): string {
    const { engine, engineName, root } = this.context;
    const { fileName, useOption } = engine.meta;
    let configPath = '';

    // Pass the config as a CLI option
    if (useOption) {
      configPath = path.join(root, '.rocket', `${engineName}.json`);

      // Make sure the folder existss
      fs.mkdirSync(path.dirname(configPath));

    // Create an rc file relative to the current root
    } else {
      configPath = path.join(root, fileName);
    }

    // Overwrite existing files
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Add to context
    this.context.configFilePath = configPath;

    return configPath;
  }

  /**
   * Create config by executing tasks in order.
   */
  execute(): Promise<Object> {
    return this.serializeTasks([]);
  }

  /**
   * Extract configuration from "rocket.<engine>" within the local project's package.json.
   */
  extractConfigFromPackage(configs: Object[]): Object[] {
    const { config } = this.tool;
    const { engineName } = this.context;

    if (config[engineName]) {
      configs.push(config[engineName]);
    }

    return configs;
  }

  /**
   * Merge multiple configuration sources using the current engine.
   */
  mergeConfigs(configs: Object[]): Object {
    const { engine } = this.context;

    return configs.reduce((masterConfig, config) => engine.mergeConfig(masterConfig, config), {});
  }

  /**
   * Load configuration from the node module (the consumer owned package).
   */
  loadConfigFromFilesystem(configs: Object[]): Object[] {
    const { config: { config: moduleName }, configLoader } = this.tool;
    const { cliArgs, engineName, root } = this.context;

    // Allow for local development
    const filePath = (moduleName === '@local')
      ? path.join(root, `config/${engineName}.js`)
      : configLoader.resolveModuleConfigPath(engineName, moduleName);

    if (fs.existsSync(filePath)) {
      configs.push(configLoader.parseFile(filePath, cliArgs));
    }

    return configs;
  }
}
