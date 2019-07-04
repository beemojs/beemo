import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { Argv as Yargv } from 'yargs';
import { Event } from '@boost/event';
import { CLI, Pipeline, Tool } from '@boost/core';
import { bool, number, string, shape } from 'optimal';
import CleanupConfigsRoutine from './routines/CleanupConfigsRoutine';
import ResolveConfigsRoutine from './routines/ResolveConfigsRoutine';
import RunDriverRoutine from './routines/RunDriverRoutine';
import RunScriptRoutine from './routines/RunScriptRoutine';
import ScaffoldRoutine from './routines/ScaffoldRoutine';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext from './contexts/ConfigContext';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import { KEBAB_PATTERN } from './constants';
import { Argv, Execution, BeemoPluginRegistry, BeemoConfig } from './types';

export function configBlueprint() {
  return {
    configure: shape({
      cleanup: bool(false),
      parallel: bool(true),
    }),
    execute: shape({
      concurrency: number(),
      graph: bool(true),
    }),
    module: process.env.BEEMO_CONFIG_MODULE
      ? string(process.env.BEEMO_CONFIG_MODULE)
      : string().required(),
  };
}

export default class Beemo extends Tool<BeemoPluginRegistry, BeemoConfig> {
  moduleRoot: string = '';

  pipeline: Pipeline<any, Beemo> | null = null;

  onResolveDependencies = new Event<[ConfigContext, Driver<any, any>[]]>('resolve-dependencies');

  onRunConfig = new Event<[ConfigContext, string[]]>('run-config');

  onRunDriver = new Event<[DriverContext, Driver<any, any>]>('run-driver');

  onRunScript = new Event<[ScriptContext]>('run-script');

  onScaffold = new Event<[ScaffoldContext, string, string, string?]>('scaffold');

  constructor(argv: Argv, binName?: string, testingOnly: boolean = false) {
    super(
      {
        appName: 'beemo',
        appPath: path.join(__dirname, '..'),
        configBlueprint: configBlueprint(),
        configName: binName || 'beemo',
        scoped: true,
      },
      argv,
    );

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.debug('Using beemo v%s', version);
    this.registerPlugin('driver', Driver as $FixMe);
    this.registerPlugin('script', Script);

    // Abort early for testing purposes
    if (testingOnly) {
      return;
    }

    this.initialize();

    // Set footer after messages have been loaded
    const footer = this.msg('app:poweredBy', { version });

    this.options.footer = `\n${this.isCI() ? '' : '🤖  '}${footer}`;
  }

  /**
   * Register global options within our CLI application.
   */
  bootstrapCLI(app: Yargv) {
    CLI.registerGlobalOptions(app as $FixMe, this);
  }

  /**
   * If the configure module has an index export that is a function,
   * execute it with the current tool instance.
   */
  bootstrapConfigModule() {
    this.debug('Bootstrapping configuration module');

    const moduleRoot = this.getConfigModuleRoot();
    const indexPath = path.join(moduleRoot, 'index.js');

    if (!fs.existsSync(indexPath)) {
      this.debug('No index.js file detected, aborting bootstrap');

      return this;
    }

    // eslint-disable-next-line
    const bootstrap = require(indexPath);
    const isFunction = typeof bootstrap === 'function';

    this.debug.invariant(isFunction, 'Executing bootstrap function', 'Found', 'Not found');

    if (isFunction) {
      bootstrap(this);
    }

    return this;
  }

  /**
   * Create a configuration file for the specified driver names.
   */
  async createConfigFiles(args: ConfigContext['args'], driverNames: string[] = []): Promise<any> {
    const context = this.prepareContext(new ConfigContext(args));

    // Create for all enabled drivers
    if (driverNames.length === 0) {
      this.getPlugins('driver').forEach(driver => {
        context.addDriverDependency(driver);
        driverNames.push(driver.name);
      });

      this.debug('Running with all drivers');

      // Create for one or many driver
    } else {
      driverNames.forEach(driverName => {
        context.addDriverDependency(this.getPlugin('driver', driverName));
      });

      this.debug('Running with %s driver(s)', driverNames.join(', '));
    }

    this.onRunConfig.emit([context, driverNames]);

    return this.startPipeline(context)
      .pipe(new ResolveConfigsRoutine('config', this.msg('app:configGenerate')))
      .run();
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): string {
    if (this.moduleRoot) {
      return this.moduleRoot;
    }

    const { configName } = this.options;
    const { module } = this.config;

    this.debug('Locating configuration module root');

    if (!module) {
      throw new Error(this.msg('errors:moduleConfigMissing', { configName }));
    }

    // Allow for local development
    if (module === '@local') {
      this.debug('Using %s configuration module', chalk.yellow('@local'));

      this.moduleRoot = process.cwd();

      return this.moduleRoot;
    }

    // Reference a node module
    const rootPath = path.join(process.cwd(), 'node_modules', module);

    if (!fs.existsSync(rootPath)) {
      throw new Error(this.msg('errors:moduleMissing', { configName, module }));
    }

    this.debug('Found configuration module root path: %s', chalk.cyan(rootPath));

    this.moduleRoot = rootPath;

    return rootPath;
  }

  /**
   * Execute all routines for the chosen driver.
   */
  async runDriver(
    args: DriverContext['args'],
    driverName: string,
    parallelArgv: Argv[] = [],
  ): Promise<Execution[]> {
    const driver = this.getPlugin('driver', driverName);
    const context = this.prepareContext(new DriverContext(args, driver, parallelArgv));
    const version = driver.getVersion();

    this.onRunDriver.emit([context, driver], driverName);

    this.debug('Running with %s v%s driver', driverName, version);

    const pipeline = this.startPipeline(context)
      .pipe(new ResolveConfigsRoutine('config', this.msg('app:configGenerate')))
      .pipe(
        new RunDriverRoutine(
          'driver',
          this.msg('app:driverRun', {
            name: driver.metadata.title,
            version,
          }),
        ),
      );

    // Only add cleanup routine if we need it
    if (this.config.configure.cleanup) {
      pipeline.pipe(new CleanupConfigsRoutine('cleanup', this.msg('app:cleanup')));
    }

    return pipeline.run(driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  async runScript(args: ScriptContext['args'], scriptName: string): Promise<Execution> {
    if (!scriptName || !scriptName.match(KEBAB_PATTERN)) {
      throw new Error(this.msg('errors:scriptNameInvalidFormat'));
    }

    const context = this.prepareContext(new ScriptContext(args, scriptName));

    this.onRunScript.emit([context], scriptName);

    this.debug('Running with %s script', context.scriptName);

    return this.startPipeline(context)
      .pipe(
        new RunScriptRoutine(
          'script',
          // Try and match the name of the class
          this.msg('app:scriptRun', { name: upperFirst(camelCase(context.scriptName)) }),
        ),
      )
      .run();
  }

  /**
   * Run the scaffold process to generate templates.
   */
  async scaffold(
    args: ScaffoldContext['args'],
    generator: string,
    action: string,
    name: string = '',
  ): Promise<any> {
    const context = this.prepareContext(new ScaffoldContext(args, generator, action, name));

    this.onScaffold.emit([context, generator, action, name]);

    this.debug('Running scaffold command');

    return this.startPipeline(context)
      .pipe(new ScaffoldRoutine('scaffold', this.msg('app:scaffoldGenerate')))
      .run();
  }

  /**
   * Setup and start a fresh pipeline.
   */
  startPipeline<T extends Context>(context: T): Pipeline<T, Beemo> {
    // Make the tool available to all processes
    process.beemo = {
      context,
      tool: this,
    };

    // Delete config files on failure
    if (this.config.configure.cleanup) {
      this.onExit.listen(code => this.handleCleanupOnFailure(code, context));
    }

    // Silence console reporter to inherit stdio
    if (context.args.stdio === 'inherit') {
      this.config.silent = true;
    }

    this.pipeline = new Pipeline(this, context);

    return this.pipeline;
  }

  /**
   * Prepare the context object by setting default values for specific properties.
   */
  protected prepareContext<T extends Context>(context: T): T {
    context.argv = this.argv;
    context.cwd = this.options.root;
    context.moduleRoot = this.getConfigModuleRoot();
    context.workspaceRoot = this.options.workspaceRoot || this.options.root;
    context.workspaces = this.getWorkspacePaths({ root: context.workspaceRoot });

    return context;
  }

  /**
   * Delete config files if a process fails.
   */
  private handleCleanupOnFailure(code: number, context: Context) {
    if (code === 0) {
      return;
    }

    // Must not be async!
    if (Array.isArray(context.configPaths)) {
      context.configPaths.forEach(config => {
        fs.removeSync(config.path);
      });
    }
  }
}
