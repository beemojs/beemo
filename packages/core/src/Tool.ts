import chalk from 'chalk';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
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
import { Event } from '@boost/event';
import { WaterfallPipeline } from '@boost/pipeline';
import { Registry } from '@boost/plugin';
import { Translator, createTranslator } from '@boost/translate';
import Config from './Config';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext from './contexts/ConfigContext';
import DriverContext from './contexts/DriverContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import ScriptContext from './contexts/ScriptContext';
import CleanupConfigsRoutine from './routines/CleanupConfigsRoutine';
import ResolveConfigsRoutine from './routines/ResolveConfigsRoutine';
import RunDriverRoutine from './routines/RunDriverRoutine';
import RunScriptRoutine from './routines/RunScriptRoutine';
import ScaffoldRoutine from './routines/ScaffoldRoutine';
import { ConfigFile, Argv } from './types';
import { KEBAB_PATTERN } from './constants';

export interface ToolOptions {
  argv: Argv;
  cwd?: string;
  projectName?: string;
  resourcePaths?: string[];
}

export default class Tool extends Contract<ToolOptions> {
  config!: ConfigFile;

  package!: PackageStructure;

  readonly argv: Argv;

  readonly configManager = new Config('beemo');

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

  protected configModuleRoot?: Path;

  constructor(options: ToolOptions) {
    super(options);

    this.argv = this.options.argv;
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
      argv: array(string()),
      cwd: string(process.cwd()).notEmpty(),
      projectName: string('beemo').kebabCase().notEmpty(),
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

    // Log information
    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.debug('Using beemo v%s', version);
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

  /**
   * Create a pipeline to run the create config files flow.
   */
  createConfigurePipeline(args: ConfigContext['args'], driverNames: string[] = []) {
    const context = this.prepareContext(new ConfigContext(args));

    // Create for all enabled drivers
    if (driverNames.length === 0) {
      this.driverRegistry.getAll().forEach((driver) => {
        context.addDriverDependency(driver);
        driverNames.push(driver.name);
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
      new ResolveConfigsRoutine('config', this.msg('app:configGenerate')),
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
      .pipe(new ResolveConfigsRoutine('config', this.msg('app:configGenerate')))
      .pipe(
        new RunDriverRoutine(
          'driver',
          this.msg('app:driverRun', {
            name: driver.metadata.title,
            version,
          }),
        ),
      )
      .pipe(
        new CleanupConfigsRoutine('cleanup', this.msg('app:cleanup'))
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
      new RunScriptRoutine(
        'script',
        // Try and match the name of the class
        this.msg('app:scriptRun', { name: upperFirst(camelCase(context.scriptName)) }),
      ),
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
      new ScaffoldRoutine('scaffold', this.msg('app:scaffoldGenerate')),
    );
  }

  /**
   * Create and setup a fresh pipeline.
   */
  protected createPipeline<C extends Context, I>(context: C, input: I) {
    // TODO
    // Delete config files on failure
    // if (this.config.configure.cleanup) {
    //   this.onExit.listen((code) => this.handleCleanupOnFailure(code, context));
    // }

    // // Silence console reporter to inherit stdio
    // if (context.args.stdio === 'inherit') {
    //   this.config.silent = true;
    // }

    return new WaterfallPipeline<C, I>(context, input);
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

    return context;
  }

  /**
   * Delete config files if a process fails.
   */
  // TODO
  private handleCleanupOnFailure(code: number, context: Context) {
    // if (code === 0) {
    //   return;
    // }
    // // Must not be async!
    // if (Array.isArray(context.configPaths)) {
    //   context.configPaths.forEach((config) => {
    //     fs.removeSync(config.path.path());
    //   });
    // }
  }
}
