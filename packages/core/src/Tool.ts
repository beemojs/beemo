import { Path, Project, Contract, Blueprint, Predicates, PackageStructure } from '@boost/common';
import { Debugger, createDebugger } from '@boost/debug';
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

  package!: PackageStructure;

  readonly configManager = new ConfigManager('beemo');

  readonly cwd: Path;

  readonly debug: Debugger;

  readonly driverRegistry: Registry<Driver>;

  readonly msg: Translator;

  readonly project: Project;

  readonly scriptRegistry: Registry<Script>;

  constructor(options: ToolOptions) {
    super(options);

    this.cwd = Path.create(this.options.cwd);

    this.debug = createDebugger('beemo');

    this.msg = createTranslator(
      ['app', 'common'],
      [new Path(__dirname, '../resources'), ...this.options.resourcePaths],
    );

    this.driverRegistry = new Registry('beemo', 'driver', {
      validate: Driver.validate,
    });

    this.scriptRegistry = new Registry('beemo', 'script', {
      validate: Script.validate,
    });

    this.project = new Project(this.cwd);
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
    this.package = this.project.getPackage();

    // @ts-ignore TODO
    this.driverRegistry.loadMany(config.drivers);

    // @ts-ignore TODO
    this.scriptRegistry.loadMany(config.scripts);
  }
}
