/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Argv as Yargv } from 'yargs';
import { CLI, Pipeline, Tool } from '@boost/core';
import { bool, number, string, Blueprint } from 'optimal';
import CleanupRoutine from './CleanupRoutine';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteDriverRoutine from './ExecuteDriverRoutine';
import ExecuteScriptRoutine from './ExecuteScriptRoutine';
import ScaffoldRoutine from './ScaffoldRoutine';
import Driver from './Driver';
import Context from './contexts/Context';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import { Argv, BeemoTool, Execution, BeemoPluginRegistry, BeemoConfig } from './types';

export default class Beemo {
  argv: Argv;

  moduleRoot: string = '';

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
    this.tool.registerPlugin('driver', Driver).initialize();

    // Set footer after messages have been loaded
    this.tool.options.footer = `\n🤖  ${this.tool.msg('app:poweredBy', { version })}`;
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
  async createConfigFiles(
    args: DriverContext['args'],
    primaryDriver: string,
    additionalDrivers: string[] = [],
  ): Promise<any> {
    const { tool } = this;
    const driver = tool.getPlugin('driver', primaryDriver);
    const context = this.prepareContext(new DriverContext(args, driver));

    additionalDrivers.forEach(driverName => {
      context.addDriverDependency(tool.getPlugin('driver', driverName));
    });

    tool.emit(`${primaryDriver}.init-driver`, [context, driver]);
    tool.debug('Running with %s driver(s)', [primaryDriver, ...additionalDrivers].join(', '));

    return this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', tool.msg('app:configGenerate')))
      .run(primaryDriver);
  }

  /**
   * Define the blueprint for Beemo configuration.
   */
  getConfigBlueprint(): Blueprint {
    return {
      configure: {
        cleanup: bool(false),
        parallel: bool(true),
      },
      execute: {
        concurrency: number(),
        priority: bool(true),
      },
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

    tool.emit(`${context.eventName}.init-driver`, [context, driver]);
    tool.debug('Running with %s driver', driverName);

    return this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', tool.msg('app:configGenerate')))
      .pipe(
        new ExecuteDriverRoutine(
          'driver',
          tool.msg('app:driverExecute', { name: driver.metadata.title }),
        ),
      )
      .pipe(new CleanupRoutine('cleanup', tool.msg('app:cleanup')))
      .run(driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  async executeScript(args: ScriptContext['args'], scriptName: string): Promise<Execution> {
    const { tool } = this;
    const context = this.prepareContext(new ScriptContext(args, scriptName));

    tool.emit(`${context.eventName}.init-script`, [context, scriptName]);
    tool.debug('Running with %s script', context.scriptName);

    return this.startPipeline(context)
      .pipe(
        new ExecuteScriptRoutine(
          'script',
          tool.msg('app:scriptExecute', { name: context.scriptName }),
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
    context.moduleRoot = this.getConfigModuleRoot();
    context.root = tool.options.root;
    context.workspaceRoot = tool.options.workspaceRoot || tool.options.root;
    context.workspaces = tool.getWorkspacePaths({ root: context.workspaceRoot });

    return context;
  }

  /**
   * Run the scaffold process to generate templates.
   */
  async scaffold(args: ScaffoldContext['args'], generator: string, action: string): Promise<any> {
    const { tool } = this;
    const context = this.prepareContext(new ScaffoldContext(args, generator, action));

    tool.emit(`${tool.options.appName}.scaffold`, [context, generator, action]);
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

    return new Pipeline(this.tool, context);
  }
}
