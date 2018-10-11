/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { Pipeline, Tool } from '@boost/core';
import { bool, shape, Blueprint } from 'optimal';
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
import { Argv, Arguments, BeemoTool, Execution, BeemoPluginRegistry, BeemoConfig } from './types';

export default class Beemo {
  argv: Argv;

  moduleRoot: string = '';

  tool: BeemoTool;

  workspacePaths: string[] = [];

  constructor(argv: Argv, binName?: string) {
    this.argv = argv;

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool = new Tool<BeemoPluginRegistry, BeemoConfig>(
      {
        appName: binName || 'beemo',
        appPath: path.join(__dirname, '..'),
        configBlueprint: this.getConfigBlueprint(),
        footer: `\n🤖  Powered by Beemo v${version}`,
        scoped: true,
      },
      argv,
    ).registerPlugin('driver', Driver);

    this.tool.debug('Using beemo v%s', version);

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
   * Create a configuration file for the specified driver names.
   */
  async createConfigFiles(
    args: Arguments,
    primaryDriver: string,
    additionalDrivers: string[] = [],
  ): Promise<any> {
    const { tool } = this;
    const driver = tool.getPlugin('driver', primaryDriver);
    const context = this.prepareContext(new DriverContext(args, driver));

    additionalDrivers.forEach(driverName => {
      context.addDriverDependency(tool.getPlugin('driver', driverName));
    });

    tool.debug('Running with %s driver(s)', [primaryDriver, ...additionalDrivers].join(', '));

    return this.startPipeline(context)
      .pipe(new ConfigureRoutine('config', 'Generating configurations'))
      .run(primaryDriver);
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

    // Reference a node module
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
    if (this.workspacePaths.length > 0) {
      return this.workspacePaths;
    }

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

    this.workspacePaths = paths.map(workspace => path.join(root, workspace));

    return this.workspacePaths;
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
      context.configPaths.forEach(config => {
        fs.removeSync(config.path);
      });
    }
  }

  /**
   * Execute all routines for the chosen driver.
   */
  async executeDriver(
    args: Arguments,
    driverName: string,
    parallelArgv: Argv[] = [],
  ): Promise<Execution[]> {
    const { tool } = this;
    const driver = tool.getPlugin('driver', driverName);
    const context = this.prepareContext(new DriverContext(args, driver, parallelArgv));

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

    tool.emit(`${driverName}.init-driver`, [driver, context]);
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
  async executeScript(args: Arguments, scriptName: string): Promise<Execution> {
    const { tool } = this;
    const context = this.prepareContext(new ScriptContext(args, scriptName));

    tool.emit(`${scriptName}.init-script`, [scriptName, context]);
    tool.debug('Running with %s script', scriptName);

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
   * Run the scaffold process to generate templates.
   */
  async scaffold(args: Arguments, generator: string, action: string): Promise<any> {
    const { tool } = this;
    const context = this.prepareContext(new ScaffoldContext(args, generator, action));

    tool.emit(`${tool.options.appName}.scaffold`, [context, generator, action]);
    tool.debug('Running scaffold command');

    return this.startPipeline(context)
      .pipe(new ScaffoldRoutine('scaffold', 'Generating from templates'))
      .run();
  }

  /**
   * Setup and start a fresh pipeline.
   */
  startPipeline<T extends Context>(context: T): Pipeline<T, BeemoTool> {
    // Make the tool available to all processes
    process.beemo = {
      context,
      tool: this.tool,
    };

    return new Pipeline(this.tool, context);
  }
}
