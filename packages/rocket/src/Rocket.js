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
  }

  /**
   * Locate the engine (boost plugin) that will be ran.
   */
  fuelEngine(engineName: string): Engine {
    const engine = this.getEngines().find(plugin => plugin.name === engineName);

    if (!engine) {
      throw new Error(`Failed to load engine "${engineName}". Have you installed it?`);
    }

    return engine;
  }

  /**
   * Return all the loaded engines.
   */
  getEngines(): Engine[] {
    return this.tool.plugins;
  }

  /**
   * Validate the configuration module and return its absolute path.
   */
  prepLaunchpad(): string {
    const { config } = this.tool.config;

    if (!config) {
      throw new Error(
        'Rocket requires a "rocket.config" property within your package.json. ' +
        'This property is the name of a module that houses your configuration files.',
      );
    }

    // Use Node's module resolution to find the module
    try {
      // eslint-disable-next-line
      require(config);
    } catch (error) {
      throw new Error('Module defined in "rocket.config" could not be found.');
    }

    return require.resolve(config);
  }

  /**
   * Launch the rocket (boost pipeline) by executing all routines for the chosen engine.
   */
  launch(engineName: string, cliArgs?: string[] = []): Promise<*> /* TODO */ {
    const configRoot = this.prepLaunchpad();
    const engine = this.fuelEngine(engineName);

    return new Pipeline(this.tool)
      .pipe(
        new PrelaunchRoutine('prelaunch', 'Create unified configuration'),
        new LaunchRoutine('launch', 'Start and run engine'),
        new PostlaunchRoutine('postlaunch', 'Display output and cleanup'),
      )
      .run(engineName, {
        cliArgs,
        configRoot,
        engine,
        engineName,
        root: this.tool.options.root,
      });
  }
}
