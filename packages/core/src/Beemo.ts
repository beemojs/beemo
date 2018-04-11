/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Pipeline, Tool, ToolInterface } from 'boost';
import { bool, shape, Blueprint, Struct } from 'optimal';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import parseArgs from 'yargs-parser';
import CleanupRoutine from './CleanupRoutine';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteDriverRoutine from './ExecuteDriverRoutine';
import ExecuteScriptRoutine from './ExecuteScriptRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';
import Driver from './Driver';
import { Context, DriverContext, ScriptContext, Execution } from './types';

export default class Beemo {
  argv: string[];

  moduleRoot: string = '';

  tool: ToolInterface;

  constructor(argv: string[]) {
    this.argv = argv;

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool = new Tool(
      {
        appName: 'beemo',
        configBlueprint: this.getConfigBlueprint(),
        footer: `🤖  Powered by Beemo v${version}`,
        pluginAlias: 'driver',
        scoped: true,
      },
      argv,
    );

    // Immediately load config and plugins
    this.tool.initialize();

    // Temporarily disable console to avoid colliding with yargs
    this.tool.console.stop();
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

    this.tool.invariant(isFunction, 'Executing bootstrap function', 'Found', 'Not found');

    if (isFunction) {
      bootstrap(this.tool);
    }

    return this;
  }

  /**
   * Create a re-usable context for each pipeline.
   */
  createContext(context: Struct = {}): any {
    return {
      ...context,
      args: this.argv,
      moduleRoot: this.getConfigModuleRoot(),
      root: this.tool.options.root,
      yargs: parseArgs(this.argv),
    };
  }

  /**
   * Define the blueprint for Beemo configuration.
   */
  getConfigBlueprint(): Blueprint {
    return {
      config: shape({
        cleanup: bool(false),
        parallel: bool(true),
      }),
    };
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): string {
    if (this.moduleRoot) {
      return this.moduleRoot;
    }

    const { module } = this.tool.config;

    this.tool.debug('Locating configuration module root');

    if (!module) {
      throw new Error(
        'Beemo requires a "beemo.module" property within your package.json. ' +
          'This property is the name of a module that houses your configuration files.',
      );
    }

    // Allow for local development
    if (module === '@local') {
      this.tool.debug(`Using ${chalk.yellow('@local')} configuration module`);

      this.moduleRoot = process.cwd();

      return this.moduleRoot;
    }

    const rootPath = path.join(process.cwd(), 'node_modules', module);

    if (!fs.existsSync(rootPath)) {
      throw new Error(`Module ${module} defined in "beemo.module" could not be found.`);
    }

    this.tool.debug(`Found configuration module root path: ${chalk.cyan(rootPath)}`);

    this.moduleRoot = rootPath;

    return rootPath;
  }

  /**
   * Delete config files if a process fails.
   */
  handleCleanupOnFailure(code: number, context: DriverContext) {
    if (code === 0) {
      return;
    }

    // Must not be async!
    if (Array.isArray(context.configPaths)) {
      context.configPaths.forEach(configPath => {
        fs.removeSync(configPath);
      });
    }
  }

  /**
   * Execute all routines for the chosen driver.
   */
  executeDriver(driverName: string): Promise<Execution[]> {
    const { tool } = this;
    const primaryDriver = tool.getPlugin(driverName) as Driver;
    const context: DriverContext = this.createContext({
      configPaths: [],
      driverName,
      drivers: [],
      primaryDriver,
    });

    // Delete config files on failure
    if (tool.config.config.cleanup) {
      tool.on(
        'exit',
        /* istanbul ignore next */ (event, code) => this.handleCleanupOnFailure(code, context),
      );
    }

    // Make the context available in the current driver
    primaryDriver.context = context;

    tool.setEventNamespace(driverName).emit('init-driver', [driverName, context.args, context]);

    tool.debug(`Running with ${driverName} driver`);

    return this.startPipeline()
      .pipe(new ConfigureRoutine('config', 'Generating configurations'))
      .pipe(new ExecuteDriverRoutine('driver', 'Executing driver'))
      .pipe(new CleanupRoutine('cleanup', 'Cleaning up'))
      .run(context, driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  executeScript(scriptName: string): Promise<Execution> {
    const context: ScriptContext = this.createContext({
      script: null,
      scriptName,
      scriptPath: '',
    });

    this.tool
      .setEventNamespace(scriptName)
      .emit('init-script', [scriptName, context.args, context]);

    this.tool.debug(`Running with ${scriptName} script`);

    return this.startPipeline()
      .pipe(new ExecuteScriptRoutine('script', `Executing ${scriptName} script`))
      .run(context, scriptName);
  }

  /**
   * Setup and start a fresh pipeline.
   */
  startPipeline<T>(): Pipeline<Driver, T> {
    const { tool } = this;

    // Start rendering console again
    tool.console.start();

    return new Pipeline(tool);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(filter: string = ''): Promise<string[]> {
    const context: Context = this.createContext();

    this.tool.setEventNamespace('beemo').emit('sync-dotfiles', [context]);

    this.tool.debug('Running dotfiles command');

    return this.startPipeline()
      .pipe(new SyncDotfilesRoutine('dotfiles', 'Syncing dotfiles', { filter }))
      .run(context);
  }
}
