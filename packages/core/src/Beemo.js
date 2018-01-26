/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Pipeline, Tool } from 'boost';
import chalk from 'chalk';
import fs from 'fs-extra';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';

import type { Event, Reporter } from 'boost';
import type { BeemoContext } from './types';
import type Driver from './Driver';

export default class Beemo {
  context: BeemoContext;

  tool: Tool<Driver, Reporter<Object>>;

  constructor() {
    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool = new Tool({
      appName: 'beemo',
      footer: `\n🤖  Powered by Beemo v${version}`,
      pluginAlias: 'driver',
      scoped: true,
    });

    // Immediately load config and plugins
    this.tool.initialize();

    // Handle exit failures
    this.tool.on('exit', this.cleanUpOnFailure);
  }

  /**
   * Delete config files on a failure.
   */
  cleanUpOnFailure = (event: Event, code: number) => {
    if (code > 0) {
      // Must not be async!
      this.context.configPaths.forEach((path) => {
        fs.removeSync(path);
      });
    }
  };

  /**
   * Validate the configuration module and return its absolute path.
   */
  getConfigModuleRoot(): string {
    const { config } = this.tool.config;

    this.tool.debug('Gathering configuration module root');

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

    // Use Node's module resolution to find the module
    try {
      require(config); // eslint-disable-line
    } catch (error) {
      throw new Error('Module defined in "beemo.config" could not be found.');
    }

    this.tool.debug(`Found configuration module root path: ${chalk.cyan(config)}`);

    return require.resolve(config);
  }

  /**
   * Override tool config with command line options.
   */
  inheritOptions(options: Object): this {
    const { debug, silent } = options;

    this.tool.config.debug = debug;
    this.tool.config.silent = silent;

    return this;
  }

  /**
   * Execute all routines for the chosen driver.
   */
  executeDriver(driverName: string, args?: string[] = []): Promise<*> {
    const { tool } = this;
    const configRoot = this.getConfigModuleRoot();
    const primaryDriver = tool.getPlugin(driverName);

    this.context = {
      args,
      argsObject: {},
      configPaths: [],
      configRoot,
      drivers: [primaryDriver],
      primaryDriver,
      root: this.tool.options.root,
    };

    this.tool.emit('run', [primaryDriver, this.context]);

    this.tool.debug(`Running with ${chalk.magenta(primaryDriver.name)} driver`);

    return new Pipeline(tool)
      .pipe(new ConfigureRoutine('configure', 'Generating configurations'))
      .pipe(new ExecuteRoutine('execute', 'Executing driver'))
      .run(driverName, this.context);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(): Promise<*> {
    this.tool.emit('sync');

    return new Pipeline(this.tool)
      .pipe(new SyncDotfilesRoutine('sync', 'Syncing dotfiles'))
      .run(this.getConfigModuleRoot());
  }
}
