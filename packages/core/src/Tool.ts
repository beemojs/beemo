import chalk from 'chalk';
import {
  Path,
  Project,
  Contract,
  Blueprint,
  Predicates,
  PackageStructure,
  requireModule,
} from '@boost/common';
import { Debugger, createDebugger } from '@boost/debug';
import { Registry } from '@boost/plugin';
import { Translator, createTranslator } from '@boost/translate';
import ConfigManager from './ConfigManager';
import Driver from './Driver';
import Script from './Script';
import { ConfigFile } from './types';

interface ToolOptions {
  cwd?: string;
  projectName?: string;
  resourcePaths?: string[];
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

  protected configModuleRoot?: Path;

  constructor(options: ToolOptions) {
    super(options);

    this.cwd = Path.create(this.options.cwd);

    this.debug = createDebugger('beemo');

    this.msg = createTranslator(
      ['app', 'common', 'errors'],
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
      projectName: string('beemo')
        .kebabCase()
        .notEmpty(),
      resourcePaths: array(string().notEmpty()),
    };
  }

  async bootstrap() {
    // Load config
    const { config } = await this.configManager.loadConfigFromRoot(this.cwd);

    this.config = config;
    this.package = this.project.getPackage();

    // Load drivers
    await this.driverRegistry.loadMany(config.drivers);

    // Load scripts
    await this.scriptRegistry.loadMany(config.scripts);
  }

  /**
   * If the configure module has an index export that is a function,
   * execute it with the current tool instance.
   */
  async bootstrapConfigModule() {
    this.debug('Bootstrapping configuration module');

    const { module } = this.config;
    let bootstrap: Function | null = null;

    try {
      if (module === '@local') {
        bootstrap = requireModule(this.getConfigModuleRoot().append('index.js'));
      } else {
        bootstrap = requireModule(module);
      }
    } catch {
      this.debug('No index.js file detected, aborting bootstrap');

      return this;
    }

    const isFunction = typeof bootstrap === 'function';

    this.debug.invariant(isFunction, 'Executing bootstrap function', 'Found', 'Not found');

    if (bootstrap && isFunction) {
      await bootstrap(this);
    }

    return this;
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): Path {
    if (this.configModuleRoot) {
      return this.configModuleRoot;
    }

    const { module } = this.config;

    this.debug('Locating configuration module root');

    if (!module) {
      throw new Error(this.msg('errors:moduleConfigMissing'));
    }

    // Allow for local development
    if (module === '@local') {
      this.debug('Using %s configuration module', chalk.yellow('@local'));

      this.configModuleRoot = new Path(process.cwd());

      return this.configModuleRoot;
    }

    // Reference a node module
    let rootPath: Path;

    try {
      rootPath = Path.resolve(require.resolve(module));
    } catch {
      throw new Error(this.msg('errors:moduleMissing', { module }));
    }

    this.debug('Found configuration module root path: %s', chalk.cyan(rootPath));

    this.configModuleRoot = rootPath;

    return rootPath;
  }
}
