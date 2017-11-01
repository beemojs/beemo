/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';

// TODO pass opts/args from command line / isolate scope
export default class CreateConfigRoutine extends Routine {
  bootstrap() {
    // TODO skip if file mtimes havent changed
    this
      .task('Loading module config', this.loadConfigFromFilesystem)
      .task('Loading project package.json config', this.extractConfigFromPackage)
      .task('Merging configs', this.mergeConfigs)
      .task('Creating config file', this.createConfigFile);
  }

  /**
   * Create a temporary configuration file to pass as a CLI argument to each engine's command.
   */
  createConfigFile(config: Config): string {
    // TODO create and return file path
  }

  /**
   * Create config by executing tasks in order.
   */
  execute(): Promise<*> /* TODO */ {
    return this.serializeTasks([]);
  }

  /**
   * Extract configuration from "rocket.<plugin>" within the local project's package.json.
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

    return configs.reduce((masterConfig, config) => engine.merge(masterConfig, config), {});
  }

  /**
   * Load configuration from the middle node module (the consumer owned package).
   */
  loadConfigFromFilesystem(configs: Object[]): Object[] {
    // TODO Use ConfigLoader???

    return configs;
  }
}
