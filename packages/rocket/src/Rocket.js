/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import { Pipeline, Tool } from 'boost';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';
import SyncDotfilesRoutine from './SyncDotfilesRoutine';

import type Engine from './Engine';
import type { Reporter } from 'boost';

export default class Rocket {
  package: Object;

  tool: Tool<Engine, Reporter>;

  constructor() {
    // eslint-disable-next-line global-require
    this.package = require('../package.json');

    this.tool = new Tool({
      appName: 'rocket',
      pluginName: 'engine',
      scoped: true,
      title: `🚀  Rocket v${this.package.version}`,
    });

    // Immediately load config and plugins
    this.tool.initialize();
  }

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
    const context = {
      args,
      configPaths: [],
      configRoot,
      engines: [primaryEngine],
      primaryEngine,
      root: this.tool.options.root,
    };

    return new Pipeline(tool)
      .pipe(new ConfigureRoutine('configure', 'Generating configurations'))
      .pipe(new ExecuteRoutine('execute', 'Executing engine'))
      .run(engineName, context);
  }

  /**
   * Sync dotfiles from the configuration module.
   */
  syncDotfiles(): Promise<*> {
    return new Pipeline(this.tool)
      .pipe(new SyncDotfilesRoutine('sync', 'Syncing dotfiles'))
      .run(this.getModuleConfigRoot());
  }
}
