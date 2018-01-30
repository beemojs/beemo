/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Pipeline, Tool } from 'boost';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';

import type { Event, Reporter } from 'boost';
import type { BeemoContext } from './types';
import type Driver from './Driver';

export default class Beemo {
  argv: string[];

  context: BeemoContext;

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

    // Handle exit failures
    this.tool.on('exit', this.cleanUpOnFailure);
  }

  /**
   * Delete config files on a failure.
   */
  cleanUpOnFailure = (event: Event, code: number) => {
    if (code > 0 && this.context) {
      // Must not be async!
      this.context.configPaths.forEach((configPath) => {
        fs.removeSync(configPath);
      });
    }
  };

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
    const configRoot = this.getConfigModuleRoot();
    const primaryDriver = tool.getPlugin(driverName);

    this.context = {
      // 0 node, 1 beemo, 2 driver
      args: this.argv.slice(3),
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
