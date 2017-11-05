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
   * Create a temporary configuration file to pass as a CLI argument to each engine's command.
   */
  createConfigFile(config: Object): string {
    const tempPath = this.getTempFilePath();
    const tempFolder = path.dirname(tempPath);

    // Make sure the folder existss
    fs.mkdirSync(tempFolder);

    // Overwrite existing files
    fs.writeFileSync(tempPath, JSON.stringify(config));

    // Add to context
    this.context.configFilePath = tempPath;

    return tempPath;
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
   * Return a file path to the temporary config file, relative to the current project root.
   */
  getTempFilePath(): string {
    return path.join(this.context.root, '.rocket', `${this.context.engineName}.json`);
  }

  /**
   * Merge multiple configuration sources using the current engine.
   */
  mergeConfigs(configs: Object[]): Object {
    const { engine } = this.context;

    return configs.reduce((masterConfig, config) => engine.merge(masterConfig, config), {});
  }

  /**
   * Load configuration from the node module (the consumer owned package).
   */
  loadConfigFromFilesystem(configs: Object[]): Object[] {
    const { config, configLoader } = this.tool;
    const { cliOptions, engineName } = this.context;
    const filePath = configLoader.resolveModuleConfigPath(engineName, config.config);

    if (fs.existsSync(filePath)) {
      configs.push(configLoader.parseFile(filePath, cliOptions));
    }

    return configs;
  }
}
