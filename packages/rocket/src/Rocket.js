/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import typeof Tool from 'boost/lib/Tool'; // TODO export
import ToolBuilder from 'boost/lib/ToolBuilder';
import { Pipeline } from 'boost';
import PrelaunchRoutine from './PrelaunchRoutine';
import LaunchRoutine from './LaunchRoutine';
import PostlaunchRoutine from './PostlaunchRoutine';
import Engine from './Engine';

export default class Rocket {
  tool: Tool;

  constructor() {
    this.tool = new ToolBuilder('rocket', 'engine').build();
  }

  /**
   * Locate the engine (boost plugin) that will be ran.
   */
  fuelEngine(engineName: string): Engine {
    const engine = this.tool.plugins.find(plugin => plugin.name === engineName);

    if (!engine) {
      throw new Error(`Failed to load engine "${engineName}". Have you installed it?`);
    }

    return engine;
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
      // eslint-disable-next-line global-require, import/no-dynamic-require
      require(config);
    } catch (error) {
      throw new Error('Module defined in "rocket.config" could not be found.');
    }

    return require.resolve(config);
  }

  /**
   * Launch the rocket (boost pipeline) by executing all routines for the chosen engine.
   */
  launch(engineName: string): Promise<*> /* TODO */ {
    const configRoot = this.prepLaunchpad();
    const engine = this.fuelEngine(engineName);

    return new Pipeline(this.tool)
      .pipe(
        new PrelaunchRoutine('prelaunch', 'Create unified configuration'),
        new LaunchRoutine('launch', 'Start and run engine'),
        new PostlaunchRoutine('postlaunch', 'Display output and cleanup'),
      )
      .run(engineName, {
        configRoot,
        engine,
        engineName,
        root: process.cwd(),
      });
  }
}
