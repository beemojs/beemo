/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import fs from 'fs-extra';
import { Pipeline, Tool } from 'boost';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';

import type { RocketContext } from './types';
import type Engine from './Engine';
import type { Event, Reporter } from 'boost';

export default class Rocket {
  context: RocketContext;

  package: Object;

  tool: Tool<Engine, Reporter<Object>>;

  constructor() {
    // eslint-disable-next-line global-require
    this.package = require('../package.json');

    this.tool = new Tool({
      appName: 'rocket',
      footer: `🚀  Powered by Rocket v${this.package.version}`,
      pluginAlias: 'engine',
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
  getModuleConfigRoot(): string {
    const { config } = this.tool.config;

    if (!config) {
      throw new Error(
        'Rocket requires a "rocket.config" property within your package.json. ' +
        'This property is the name of a module that houses your configuration files.',
      );
    }

    // Allow for local development
    if (config === '@local') {
      return process.cwd();
    }

    // Use Node's module resolution to find the module
    try {
      require(config); // eslint-disable-line
    } catch (error) {
      throw new Error('Module defined in "rocket.config" could not be found.');
    }

    return require.resolve(config);
  }

  /**
   * Launch the rocket (boost pipeline) by executing all routines for the chosen engine.
   */
  launchEngine(engineName: string, args?: string[] = []): Promise<*> {
    const { tool } = this;
    const configRoot = this.getModuleConfigRoot();
    const primaryEngine = tool.getPlugin(engineName);

    this.context = {
      args,
      configPaths: [],
      configRoot,
      engines: [primaryEngine],
      primaryEngine,
      root: this.tool.options.root,
    };

    this.tool.emit('launch', null, [primaryEngine, this.context]);

    return new Pipeline(tool)
      .pipe(new ConfigureRoutine('configure', 'Generating configurations'))
      .pipe(new ExecuteRoutine('execute', 'Executing engine'))
      .run(engineName, this.context);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(): Promise<*> {
    this.tool.emit('sync');

    return new Pipeline(this.tool)
      .pipe(new SyncDotfilesRoutine('sync', 'Syncing dotfiles'))
      .run(this.getModuleConfigRoot());
  }
}
