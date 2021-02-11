/* eslint-disable @typescript-eslint/member-ordering */

import chalk from 'chalk';
import fs from 'fs-extra';
import {
  Bind,
  Blueprint,
  Contract,
  Memoize,
  PackageStructure,
  Path,
  PortablePath,
  Predicates,
  Project,
  requireModule,
} from '@boost/common';
import { createDebugger, Debugger } from '@boost/debug';
import { Event } from '@boost/event';
import { WaterfallPipeline } from '@boost/pipeline';
import { Registry } from '@boost/plugin';
import { createTranslator, Translator } from '@boost/translate';
import Config from './Config';
import { KEBAB_PATTERN } from './constants';
import ConfigContext from './contexts/ConfigContext';
import Context from './contexts/Context';
import DriverContext from './contexts/DriverContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import ScriptContext from './contexts/ScriptContext';
import Driver from './Driver';
import CleanupConfigsRoutine from './routines/CleanupConfigsRoutine';
import ResolveConfigsRoutine from './routines/ResolveConfigsRoutine';
import RunDriverRoutine from './routines/RunDriverRoutine';
import RunScriptRoutine from './routines/RunScriptRoutine';
import ScaffoldRoutine from './routines/ScaffoldRoutine';
import Script from './Script';
import { Argv, ConfigFile } from './types';

export interface ToolOptions {
  argv: Argv;
  cwd?: PortablePath;
  projectName?: string;
  resourcePaths?: string[];
}

export default class Tool extends Contract<ToolOptions> {
  config!: ConfigFile;

  context?: Context;

  package!: PackageStructure;

  readonly argv: Argv;

  readonly configManager: Config;

  readonly cwd: Path;

  readonly debug: Debugger;

  readonly driverRegistry: Registry<Driver>;

  readonly msg: Translator;

  readonly project: Project;

  readonly onResolveDependencies = new Event<[ConfigContext, Driver[]]>('resolve-dependencies');

  readonly onRunCreateConfig = new Event<[ConfigContext, string[]]>('run-create-config');

  readonly onRunDriver = new Event<[DriverContext, Driver]>('run-driver');

  readonly onRunScaffold = new Event<[ScaffoldContext, string, string, string?]>('run-scaffold');

  readonly onRunScript = new Event<[ScriptContext]>('run-script');

  readonly scriptRegistry: Registry<Script>;

  constructor(options: ToolOptions) {
    super(options);

    this.argv = this.options.argv;
    this.cwd = Path.create(this.options.cwd);

    this.debug = createDebugger('core');
    // eslint-disable-next-line global-require
    this.debug('Using beemo v%s', require('../package.json').version);

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
    this.configManager = new Config(this.options.projectName);

    // TODO MIGRATE
    // @ts-expect-error
    this.getWorkspacePaths = this.project.getWorkspacePackagePaths.bind(this.project);
    // @ts-expect-error
    this.getWorkspaceGlobs = this.project.getWorkspaceGlobs.bind(this.project);
  }

  blueprint({ array, instance, string, union }: Predicates): Blueprint<ToolOptions> {
    return {
      argv: array(string()),
      cwd: union([instance(Path).notNullable(), string().notEmpty()], process.cwd()),
      projectName: string('beemo').camelCase().notEmpty(),
      resourcePaths: array(string().notEmpty()),
    };
  }

  async bootstrap() {
    // Load config
    const { config } = await this.configManager.loadConfigFromRoot(this.cwd);

    this.config = config;
    this.package = this.project.getPackage();

    // Load drivers
    await this.driverRegistry.loadMany(config.drivers, { tool: this });

    // Load scripts
    await this.scriptRegistry.loadMany(config.scripts, { tool: this });
  }

  /**
   * If the config module has an index that exports a function,
   * execute it with the current tool instance.
   */
  async bootstrapConfigModule() {
    this.debug('Bootstrapping configuration module');

    const { module } = this.config;
    let bootstrap: Function | null = null;

    try {
      bootstrap = requireModule(module === '@local' ? this.getConfigModuleRoot() : module);
    } catch {
      this.debug('No entry point file detected, aborting bootstrap');

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
   * Validate the configuration module and return an absolute path to its root folder.
   */
  @Memoize()
  getConfigModuleRoot(): Path {
    const { module } = this.config;

    this.debug('Locating configuration module root');

    if (!module) {
      throw new Error(this.msg('errors:moduleConfigMissing'));
    }

    // Allow for local development
    if (module === '@local') {
      this.debug('Using %s configuration module', chalk.yellow('@local'));

      return new Path(this.options.cwd);
    }

    // Reference a node module
    let rootPath: Path;

    try {
      rootPath = Path.resolve(require.resolve(`${module}/package.json`)).parent();
    } catch {
      throw new Error(this.msg('errors:moduleMissing', { module }));
    }

    this.debug('Found configuration module root path: %s', chalk.cyan(rootPath));

    return rootPath;
  }

  /**
   * Delete config files if a process fails.
   */
  @Bind()
  cleanupOnFailure(error?: Error) {
    const { context } = this;

    if (!error || !context) {
      return;
    }

    // Must not be async!
    if (Array.isArray(context.configPaths)) {
      context.configPaths.forEach((config) => {
        fs.removeSync(config.path.path());
      });
    }
  }

  /**
   * Create a pipeline to run the create config files flow.
   */
  createConfigurePipeline(args: ConfigContext['args'], driverNames: string[] = []) {
    const context = this.prepareContext(new ConfigContext(args));

    // Create for all enabled drivers
    if (driverNames.length === 0) {
      this.driverRegistry.getAll().forEach((driver) => {
        context.addDriverDependency(driver);
        driverNames.push(driver.getName());
      });

      this.debug('Running with all drivers');

      // Create for one or many driver
    } else {
      driverNames.forEach((driverName) => {
        context.addDriverDependency(this.driverRegistry.get(driverName));
      });

      this.debug('Running with %s driver(s)', driverNames.join(', '));
    }

    this.onRunCreateConfig.emit([context, driverNames]);

    return new WaterfallPipeline(context).pipe(
      new ResolveConfigsRoutine('config', this.msg('app:configGenerate'), {
        tool: this,
      }),
    );
  }

  /**
   * Execute all routines for the chosen driver.
   */
  createRunDriverPipeline(
    args: DriverContext['args'],
    driverName: string,
    parallelArgv: Argv[] = [],
  ) {
    const driver = this.driverRegistry.get(driverName);
    const context = this.prepareContext(new DriverContext(args, driver, parallelArgv));
    const version = driver.getVersion();

    this.onRunDriver.emit([context, driver], driverName);

    this.debug('Running with %s v%s driver', driverName, version);

    return new WaterfallPipeline(context, driverName)
      .pipe(
        new ResolveConfigsRoutine('config', this.msg('app:configGenerate'), {
          tool: this,
        }),
      )
      .pipe(
        new RunDriverRoutine(
          'driver',
          this.msg('app:driverRun', {
            name: driver.metadata.title,
            version,
          }),
          { tool: this },
        ),
      )
      .pipe(
        new CleanupConfigsRoutine('cleanup', this.msg('app:cleanup'), {
          tool: this,
        })
          // Only add cleanup routine if we need it
          .skip(!this.config.configure.cleanup),
      );
  }

  /**
   * Run a script found within the configuration module.
   */
  createRunScriptPipeline(args: ScriptContext['args'], scriptName: string) {
    if (!scriptName || !scriptName.match(KEBAB_PATTERN)) {
      throw new Error(this.msg('errors:scriptNameInvalidFormat'));
    }

    const context = this.prepareContext(new ScriptContext(args, scriptName));

    this.onRunScript.emit([context], scriptName);

    this.debug('Running with %s script', context.scriptName);

    return new WaterfallPipeline(context).pipe(
      new RunScriptRoutine('script', this.msg('app:scriptRun', { name: scriptName }), {
        tool: this,
      }),
    );
  }

  /**
   * Create a pipeline to run the scaffolding flow.
   */
  createScaffoldPipeline(
    args: ScaffoldContext['args'],
    generator: string,
    action: string,
    name: string = '',
  ) {
    const context = this.prepareContext(new ScaffoldContext(args, generator, action, name));

    this.onRunScaffold.emit([context, generator, action, name]);

    this.debug('Creating scaffold pipeline');

    return new WaterfallPipeline(context).pipe(
      new ScaffoldRoutine('scaffold', this.msg('app:scaffoldGenerate'), {
        tool: this,
      }),
    );
  }

  /**
   * Prepare the context object by setting default values for specific properties.
   */
  protected prepareContext<T extends Context>(context: T): T {
    context.argv = this.argv;
    context.cwd = this.cwd;
    context.configModuleRoot = this.getConfigModuleRoot();
    context.workspaceRoot = this.project.root;
    context.workspaces = this.project.getWorkspaceGlobs();

    // Make the tool available for all processes
    process.beemo = {
      context,
      tool: this,
    };

    // Set the current class to the tool instance
    this.context = context;

    return context;
  }

  // TODO MIGRATE
  /* eslint-disable @typescript-eslint/member-ordering, no-dupe-class-members */

  getPlugin(type: 'driver', name: string): Driver;

  getPlugin(type: 'script', name: string): Script;

  getPlugin(type: 'driver' | 'script', name: string): unknown {
    return type === 'driver' ? this.driverRegistry.get(name) : this.scriptRegistry.get(name);
  }

  isPluginEnabled(type: 'driver' | 'script', name: string): boolean {
    return type === 'driver'
      ? this.driverRegistry.isRegistered(name)
      : this.scriptRegistry.isRegistered(name);
  }
}
