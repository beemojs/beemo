import { Path } from '@boost/common';
import { Registry } from '@boost/plugin';
import ConfigManager from './ConfigManager';
import Driver from './Driver';
import Script from './Script';
import { ConfigFile } from './types';

export default class Tool {
  config!: ConfigFile;

  readonly configManager = new ConfigManager('beemo');

  readonly cwd: Path;

  readonly driverRegistry: Registry<Driver>;

  readonly scriptRegistry: Registry<Script>;

  constructor(cwd: string = process.cwd()) {
    this.cwd = new Path(cwd);

    this.driverRegistry = new Registry('beemo', 'driver', {
      validate: Driver.validate,
    });

    this.scriptRegistry = new Registry('beemo', 'script', {
      validate: Script.validate,
    });
  }

  async bootstrap() {
    const { config } = await this.configManager.loadConfigFromRoot(this.cwd);

    this.config = config;

    // @ts-ignore TODO
    this.driverRegistry.loadMany(config.drivers);

    // @ts-ignore TODO
    this.scriptRegistry.loadMany(config.scripts);
  }
}
