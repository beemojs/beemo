/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import { Pipeline, Tool } from 'boost';
import CleanupRoutine from './CleanupRoutine';
import ConfigureRoutine from './ConfigureRoutine';
import ExecuteRoutine from './ExecuteRoutine';

import type Engine from './Engine';
import type { Renderer, ResultPromise } from 'boost';

export default class Rocket {
  tool: Tool<Engine, Renderer>;

  constructor() {
    this.tool = new Tool({
      appName: 'rocket',
      pluginName: 'engine',
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
  launch(engineName: string, args?: string[] = []): ResultPromise {
    const { tool } = this;
    const configRoot = this.getModuleConfigRoot();
    const primaryEngine = tool.getPlugin(engineName);

    return new Pipeline(tool)
      .pipe(
        new ConfigureRoutine('configure', 'Creating unified configurations'),
        new ExecuteRoutine('execute', 'Executing primary engine'),
        new CleanupRoutine('cleanup', 'Displaying and cleaning output'),
      )
      .run(engineName, {
        args,
        configPaths: [],
        configRoot,
        engines: [primaryEngine],
        primaryEngine,
        root: this.tool.options.root,
      })
      .catch((error) => {
        // Nothing has been logged yet, so lets show something to the user atleast
        if (tool.errors.length === 0) {
          tool.logError(error.message);
          tool.renderer.update(true);
        }
      });
  }
}
