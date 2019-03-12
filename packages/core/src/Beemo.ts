import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { Argv as Yargv } from 'yargs';
import { CLI, Pipeline, Tool } from '@boost/core';
import { bool, number, string, shape, Blueprint } from 'optimal';
import CleanupRoutine from './CleanupRoutine';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteDriverRoutine from './ExecuteDriverRoutine';
import ExecuteScriptRoutine from './ExecuteScriptRoutine';
import ScaffoldRoutine from './ScaffoldRoutine';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext from './contexts/ConfigContext';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import { KEBAB_PATTERN } from './constants';
import { Argv, BeemoTool, Execution, BeemoPluginRegistry, BeemoConfig } from './types';

export default class Beemo {
  argv: Argv;

  moduleRoot: string = '';

  pipeline: Pipeline<any, BeemoTool> | null = null;

  tool: BeemoTool;

  constructor(argv: Argv, binName?: string, tool?: BeemoTool) {
    this.argv = argv;

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool =
      tool ||
      new Tool<BeemoPluginRegistry, BeemoConfig>(
        {
          appName: 'beemo',
          appPath: path.join(__dirname, '..'),
          configBlueprint: this.getConfigBlueprint(),
          configName: binName,
          scoped: true,
        },
        argv,
      );

    this.tool.debug('Using beemo v%s', version);

    // Immediately load config and plugins
    this.tool
      .registerPlugin('driver', Driver)
      .registerPlugin('script', Script)
      .initialize();

    // Set footer after messages have been loaded
    const footer = this.tool.msg('app:poweredBy', { version });

    this.tool.options.footer = `\n${this.tool.isCI() ? '' : '🤖  '}${footer}`;
  }

  /**
   * Register global options within our CLI application.
   */
  bootstrapCLI(app: Yargv) {
    CLI.registerGlobalOptions(app, this.tool);
  }

  /**
   * If the configure module has an index export that is a function,
   * execute it with the current tool instance.
   */
  bootstrapConfigModule() {
    this.tool.debug('Bootstrapping configuration module');

    const moduleRoot = this.getConfigModuleRoot();
    const indexPath = path.join(moduleRoot, 'index.js');

    if (!fs.existsSync(indexPath)) {
      this.tool.debug('No index.js file detected, aborting bootstrap');

      return this;
    }

    // eslint-disable-next-line
    const bootstrap = require(indexPath);
    const isFunction = typeof bootstrap === 'function';

    this.tool.debug.invariant(isFunction, 'Executing bootstrap function', 'Found', 'Not found');

    if (isFunction) {
      bootstrap(this.tool);
    }

    return this;
  }

  /**
   * Create a configuration file for the specified driver names.
   */
  async createConfigFiles(args: ConfigContext['args'], driverNames: string[] = []): Promise<any> {
    const { tool } = this;
    const context = this.prepareContext(new ConfigContext(args));

    // Create for all enabled drivers
    if (driverNames.length === 0) {
      tool.getPlugins('driver').forEach(driver => {
        context.addDriverDependency(driver);
      });

      tool.debug('Running with all drivers');

      // Create for one or many driver
    } else {
      driverNames.forEach(driverName => {
        context.addDriverDependency(tool.getPlugin('driver', driverName));
      });

      tool.debug('Running with %s driver(s)', driverNames.join(', '));

      // Emit for the primary driver so any bootstrap events can react
      const driver = tool.getPlugin('driver', driverNames[0]);

      tool.emit(`${driver.name}.init-driver`, [context, driver]);
    }

    return this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', tool.msg('app:configGenerate')))
      .run();
  }

  /**
   * Define the blueprint for Beemo configuration.
   */
  getConfigBlueprint(): Blueprint<Partial<BeemoConfig>> {
    return {
      configure: shape({
        cleanup: bool(false),
        parallel: bool(true),
      }),
      execute: shape({
        concurrency: number(),
        priority: bool(true),
      }),
      module: process.env.BEEMO_CONFIG_MODULE
        ? string(process.env.BEEMO_CONFIG_MODULE)
        : string().required(),
    };
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): string {
    if (this.moduleRoot) {
      return this.moduleRoot;
    }

    const { tool } = this;
    const { configName } = tool.options;
    const { module } = tool.config;

    tool.debug('Locating configuration module root');

    if (!module) {
      throw new Error(tool.msg('errors:moduleConfigMissing', { configName }));
    }

    // Allow for local development
    if (module === '@local') {
      tool.debug('Using %s configuration module', chalk.yellow('@local'));

      this.moduleRoot = process.cwd();

      return this.moduleRoot;
    }

    // Reference a node module
    const rootPath = path.join(process.cwd(), 'node_modules', module);

    if (!fs.existsSync(rootPath)) {
      throw new Error(tool.msg('errors:moduleMissing', { configName, module }));
    }

    tool.debug('Found configuration module root path: %s', chalk.cyan(rootPath));

    this.moduleRoot = rootPath;

    return rootPath;
  }

  /**
   * Delete config files if a process fails.
   */
  handleCleanupOnFailure(code: number, context: Context) {
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

  /**
   * Execute all routines for the chosen driver.
   */
  async executeDriver(
    args: DriverContext['args'],
    driverName: string,
    parallelArgv: Argv[] = [],
  ): Promise<Execution[]> {
    const { tool } = this;
    const driver = tool.getPlugin('driver', driverName);
    const context = this.prepareContext(new DriverContext(args, driver, parallelArgv));
    const version = driver.getVersion();

    tool.emit(`${context.eventName}.init-driver`, [context, driver]);
    tool.debug('Running with %s v%s driver', driverName, version);

    const pipeline = this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', tool.msg('app:configGenerate')))
      .pipe(
        new ExecuteDriverRoutine(
          'driver',
          tool.msg('app:driverExecute', {
            name: driver.metadata.title,
            version,
          }),
        ),
      );

    // Only add cleanup routine if we need it
    if (tool.config.configure.cleanup) {
      pipeline.pipe(new CleanupRoutine('cleanup', tool.msg('app:cleanup')));
    }

    return pipeline.run(driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  async executeScript(args: ScriptContext['args'], scriptName: string): Promise<Execution> {
    const { tool } = this;

    if (!scriptName || !scriptName.match(KEBAB_PATTERN)) {
      throw new Error(tool.msg('errors:scriptNameInvalidFormat'));
    }

    const context = this.prepareContext(new ScriptContext(args, scriptName));

    tool.emit(`${context.eventName}.init-script`, [context, scriptName]);
    tool.debug('Running with %s script', context.scriptName);

    return this.startPipeline(context)
      .pipe(
        new ExecuteScriptRoutine(
          'script',
          // Try and match the name of the class
          tool.msg('app:scriptExecute', { name: upperFirst(camelCase(context.scriptName)) }),
        ),
      )
      .run();
  }

  /**
   * Prepare the context object by setting default values for specific properties.
   */
  prepareContext<T extends Context>(context: T): T {
    const { tool } = this;

    context.argv = this.argv;
    context.cwd = tool.options.root;
    context.moduleRoot = this.getConfigModuleRoot();
    context.workspaceRoot = tool.options.workspaceRoot || tool.options.root;
    context.workspaces = tool.getWorkspacePaths({ root: context.workspaceRoot });

    return context;
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
    const { tool } = this;
    const context = this.prepareContext(new ScaffoldContext(args, generator, action, name));

    tool.emit(`${tool.options.appName}.scaffold`, [context, generator, action, name]);
    tool.debug('Running scaffold command');

    return this.startPipeline(context)
      .pipe(new ScaffoldRoutine('scaffold', tool.msg('app:scaffoldGenerate')))
      .run();
  }

  /**
   * Setup and start a fresh pipeline.
   */
  startPipeline<T extends Context>(context: T): Pipeline<T, BeemoTool> {
    const { tool } = this;

    // Make the tool available to all processes
    process.beemo = {
      context,
      tool,
    };

    // Delete config files on failure
    if (tool.config.configure.cleanup) {
      tool.on(
        'exit',
        /* istanbul ignore next */ code => this.handleCleanupOnFailure(code, context),
      );
    }

    this.pipeline = new Pipeline(this.tool, context);

    return this.pipeline;
  }
}
