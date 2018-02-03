/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable no-magic-numbers */

import { Pipeline, Tool } from 'boost';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import parseArgs from 'yargs-parser';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';
import RunScriptRoutine from './RunScriptRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';

import type { Event, Reporter } from 'boost'; // eslint-disable-line
import type { Context, DriverContext, ScriptContext } from './types';
import type Driver from './Driver';

export default class Beemo {
  argv: string[];

  tool: Tool<Driver, Reporter<Object>>;

  constructor(argv: string[]) {
    this.argv = argv;

    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool = new Tool({
      appName: 'beemo',
      configFolder: './configs',
      footer: `🤖  Powered by Beemo v${version}`,
      pluginAlias: 'driver',
      scoped: true,
    }, argv);

    // Immediately load config and plugins
    this.tool.initialize();
  }

  /**
   * Create a re-usable context for each pipeline.
   */
  createContext(context?: Object = {}, slice?: number = 3): * {
    // 0 node, 1 beemo, 2 <driver, command>
    const args = this.argv.slice(slice);

    return {
      ...context,
      args,
      configRoot: this.getConfigModuleRoot(),
      root: this.tool.options.root,
      yargs: parseArgs(args),
    };
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): string {
    const { config } = this.tool.config;

    this.tool.debug('Locating configuration module root');

    if (!config) {
      throw new Error(
        'Beemo requires a "beemo.config" property within your package.json. ' +
        'This property is the name of a module that houses your configuration files.',
      );
    }

    // Allow for local development
    if (config === '@local') {
      this.tool.debug(`Using ${chalk.yellow('@local')} configuration module`);

      return process.cwd();
    }

    const rootPath = path.join(process.cwd(), 'node_modules', config);

    if (!fs.existsSync(rootPath)) {
      throw new Error('Module defined in "beemo.config" could not be found.');
    }

    this.tool.debug(`Found configuration module root path: ${chalk.cyan(rootPath)}`);

    return rootPath;
  }

  /**
   * Execute all routines for the chosen driver.
   */
  executeDriver(driverName: string): Promise<*> {
    const { tool } = this;
    const primaryDriver = tool.getPlugin(driverName);
    const context: DriverContext = this.createContext({
      configPaths: [],
      drivers: [primaryDriver],
      primaryDriver,
    });

    // Delete config files on failure
    tool.on('exit', (event, code) => {
      if (code === 0) {
        return;
      }

      // Must not be async!
      context.configPaths.forEach((configPath) => {
        fs.removeSync(configPath);
      });
    });

    tool.emit('driver', [driverName, context]);

    tool.debug(`Running with ${driverName} driver`);

    return new Pipeline(tool)
      .pipe(new ConfigureRoutine('configure', 'Generating configurations'))
      .pipe(new ExecuteRoutine('execute', `Executing ${driverName} driver`))
      .run(driverName, context);
  }

  /**
   * Run a script found within the configuration module.
   */
  executeScript(scriptName: string): Promise<*> {
    const { tool } = this;
    const context: ScriptContext = this.createContext({
      script: null,
      scriptName,
      scriptPath: '',
    }, 4);

    tool.emit('script', [scriptName, context]);

    tool.debug(`Running with ${scriptName} script`);

    return new Pipeline(tool)
      .pipe(new RunScriptRoutine('script', `Executing ${scriptName} script`))
      .run(scriptName, context);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(): Promise<*> {
    const { tool } = this;
    const context: Context = this.createContext();

    tool.emit('dotfiles', [context]);

    tool.debug('Running dotfiles command');

    return new Pipeline(tool)
      .pipe(new SyncDotfilesRoutine('sync', 'Syncing dotfiles'))
      .run(null, context);
  }
}
