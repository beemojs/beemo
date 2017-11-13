/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import { Pipeline, Tool } from 'boost';
import PrelaunchRoutine from './PrelaunchRoutine';
import LaunchRoutine from './LaunchRoutine';
import PostlaunchRoutine from './PostlaunchRoutine';
import Engine from './Engine';

export default class Rocket {
  tool: Tool;

  constructor() {
    this.tool = new Tool({
      appName: 'rocket',
      pluginName: 'engine',
    });

    // Immediately load config and plugins
    this.tool.initialize();

    // Provide some helper methods
    this.tool.getEngine = this.getEngine;
  }

  /**
   * Locate a engine (boost plugin) by name.
   */
  getEngine = (engineName: string): Engine => {
    const engine = this.getEngines().find(plugin => plugin.name === engineName);

    if (!engine) {
      throw new Error(`Failed to find engine "${engineName}". Have you installed it?`);
    }

    return engine;
  };

  /**
   * Return all loaded engines.
   */
  getEngines(): Engine[] {
    return this.tool.plugins;
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
  launch(engineName: string, cliArgs?: string[] = []): Promise<*> /* TODO */ {
    const configRoot = this.getModuleConfigRoot();
    const primaryEngine = this.getEngine(engineName);

    return new Pipeline(this.tool)
      .pipe(
        new PrelaunchRoutine('prelaunch', 'Creating unified configurations'),
        new LaunchRoutine('launch', 'Running primary engine'),
        new PostlaunchRoutine('postlaunch', 'Displaying and cleaning output'),
      )
      .run(engineName, {
        cliArgs,
        configFilePaths: {},
        configRoot,
        engines: [primaryEngine],
        primaryEngine,
        root: this.tool.options.root,
      });
  }
}
