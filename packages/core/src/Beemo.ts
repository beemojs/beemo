/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Pipeline, Tool, ToolInterface } from 'boost';
import { bool, shape, Blueprint, Struct } from 'optimal';
import parseArgs from 'yargs-parser';
import CleanupRoutine from './CleanupRoutine';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteDriverRoutine from './ExecuteDriverRoutine';
import ExecuteScriptRoutine from './ExecuteScriptRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';
import Driver from './Driver';
import Context from './contexts/Context';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';
import { Argv, Arguments, Execution } from './types';

export default class Beemo {
  argv: Argv;

  moduleRoot: string = '';

  tool: ToolInterface;

  constructor(argv: Argv) {
    this.argv = argv;

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    // TODO replace?
    const args = parseArgs(argv);

    this.tool = new Tool(
      {
        appName: 'beemo',
        configBlueprint: this.getConfigBlueprint(),
        console: {
          footer: `\n🤖  Powered by Beemo v${version}`,
          silent: args.silent || false,
          theme: args.theme || 'default',
          verbose: args.verbose || 3,
        },
        pluginAlias: 'driver',
        scoped: true,
      },
      argv,
    );

    // Immediately load config and plugins
    this.tool.initialize();
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
      this.tool.debug('Using %s configuration module', chalk.yellow('@local'));

      this.moduleRoot = process.cwd();

      return this.moduleRoot;
    }

    const rootPath = path.join(process.cwd(), 'node_modules', module);

    if (!fs.existsSync(rootPath)) {
      throw new Error(`Module ${module} defined in "beemo.module" could not be found.`);
    }

    this.tool.debug('Found configuration module root path: %s', chalk.cyan(rootPath));

    this.moduleRoot = rootPath;

    return rootPath;
  }

  /**
   * Return a list of absolute paths for Yarn or Lerna workspaces.
   */
  getWorkspacePaths(): string[] {
    const { workspaces } = this.tool.package;
    const root = this.tool.options.workspaceRoot || this.tool.options.root;
    const paths = [];

    if (workspaces) {
      if (Array.isArray(workspaces)) {
        paths.push(...workspaces);
      } else if (Array.isArray(workspaces.packages)) {
        paths.push(...workspaces.packages);
      }
    }

    const lernaPath = path.join(root, 'lerna.json');

    if (paths.length === 0 && fs.existsSync(lernaPath)) {
      const lerna = fs.readJsonSync(lernaPath);

      if (Array.isArray(lerna.packages)) {
        paths.push(...lerna.packages);
      }
    }

    return paths.map(workspace => path.join(root, workspace));
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
  executeDriver(driverName: string, args: Arguments): Promise<Execution[]> {
    const { tool } = this;
    const driver = tool.getPlugin(driverName) as Driver<any>;
    const context = this.prepareContext(new DriverContext(args, driver));

    // Delete config files on failure
    if (tool.config.config.cleanup) {
      tool.on(
        'exit',
        /* istanbul ignore next */ code => this.handleCleanupOnFailure(code, context),
      );
    }

    // Set workspace related properties
    context.workspaceRoot = tool.options.workspaceRoot || tool.options.root;
    context.workspaces = this.getWorkspacePaths();

    tool.setEventNamespace(driverName);
    tool.emit('init-driver', [driverName, context.argv, context]);
    tool.debug('Running with %s driver', driverName);

    return this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', 'Generating configurations'))
      .pipe(new ExecuteDriverRoutine('driver', 'Executing driver'))
      .pipe(new CleanupRoutine('cleanup', 'Cleaning up'))
      .run(driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  executeScript(scriptName: string, args: Arguments): Promise<Execution> {
    const context = this.prepareContext(new ScriptContext(args));

    this.tool.setEventNamespace(scriptName);
    this.tool.emit('init-script', [scriptName, context.argv, context]);
    this.tool.debug('Running with %s script', scriptName);

    return this.startPipeline(context)
      .pipe(new ExecuteScriptRoutine('script', `Executing ${scriptName} script`))
      .run(scriptName);
  }

  /**
   * Prepare the context object by setting default values for specific properties.
   */
  prepareContext<T extends Context>(context: T): T {
    context.argv = this.argv;
    context.moduleRoot = this.getConfigModuleRoot();
    context.root = this.tool.options.root;

    return context;
  }

  /**
   * Setup and start a fresh pipeline.
   */
  startPipeline<T extends Context>(context: T): Pipeline<Driver<any>, T> {
    // Make the tool available to all processes
    process.beemo = {
      args: context.args,
      tool: this.tool,
    };

    return new Pipeline(this.tool, context);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(args: Arguments): Promise<string[]> {
    const context = this.prepareContext(new Context(args));

    this.tool.setEventNamespace('beemo');
    this.tool.emit('sync-dotfiles', [context]);
    this.tool.debug('Running dotfiles command');

    return this.startPipeline(context)
      .pipe(new SyncDotfilesRoutine('dotfiles', 'Syncing dotfiles', { filter: args.filter }))
      .run();
  }
}
