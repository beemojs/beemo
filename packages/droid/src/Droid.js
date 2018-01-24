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

import type { DroidContext } from './types';
import type Engine from './Engine';
import type { Event, Reporter } from 'boost';

export default class Droid {
  context: DroidContext;

  tool: Tool<Engine, Reporter<Object>>;

  constructor() {
    // eslint-disable-next-line global-require
    const { version } = require('../package.json');

    this.tool = new Tool({
      appName: 'droid',
      footer: `\n🤖  Powered by Droid v${version}`,
      pluginAlias: 'engine',
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
  getModuleConfigRoot(): string {
    const { config } = this.tool.config;

    this.tool.debug('Gathering configuration module root');

    if (!config) {
      throw new Error(
        'Droid requires a "droid.config" property within your package.json. ' +
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
      throw new Error('Module defined in "droid.config" could not be found.');
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
   * Launch the engine (boost pipeline) by executing all routines for the chosen engine.
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

    this.tool.debug(`Launching with ${chalk.magenta(primaryEngine.name)} engine`);

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
