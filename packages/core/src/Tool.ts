import { Path, Contract, Blueprint, Predicates } from '@boost/common';
import { Registry } from '@boost/plugin';
import { Translator, createTranslator } from '@boost/translate';
import ConfigManager from './ConfigManager';
import Driver from './Driver';
import Script from './Script';
import { ConfigFile } from './types';

interface ToolOptions {
  cwd: string;
  resourcePaths: string[];
}

export default class Tool extends Contract<ToolOptions> {
  config!: ConfigFile;

  readonly configManager = new ConfigManager('beemo');

  readonly cwd: Path;

  readonly driverRegistry: Registry<Driver>;

  readonly msg: Translator;

  readonly scriptRegistry: Registry<Script>;

  constructor(options: ToolOptions) {
    super(options);

    this.cwd = Path.create(this.options.cwd);

    this.driverRegistry = new Registry('beemo', 'driver', {
      validate: Driver.validate,
    });

    this.scriptRegistry = new Registry('beemo', 'script', {
      validate: Script.validate,
    });

    this.msg = createTranslator(
      ['app', 'common'],
      [new Path(__dirname, '../resources'), ...this.options.resourcePaths],
    );
  }

  blueprint({ array, string }: Predicates): Blueprint<ToolOptions> {
    return {
      cwd: string(process.cwd()).notEmpty(),
      resourcePaths: array(string().notEmpty()),
    };
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
