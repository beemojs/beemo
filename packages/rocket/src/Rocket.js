/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */


import typeof Tool from 'boost/lib/Tool'; // TODO export
import ToolBuilder from 'boost/lib/ToolBuilder';
import { Pipeline } from 'boost';
import CleanOutputRoutine from './CleanOutputRoutine';
import CreateConfigRoutine from './CreateConfigRoutine';
import RunEngineRoutine from './RunEngineRoutine';
import Engine from './Engine';

export default class Rocket {
  tool: Tool;

  constructor() {
    this.tool = new ToolBuilder('rocket', 'engine').build();
  }

  /**
   * Locate the engine (boost plugin) that will be ran.
   */
  igniteEngine(engineName: string): Engine {
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
        'Rocket requires a "rocket.config" property within your package.json, ' +
        'which is the name of a module that houses your configuration files.',
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
    const engine = this.igniteEngine(engineName);

    return new Pipeline(this.tool)
      .pipe(
        new CreateConfigRoutine('configure', 'Create unified configuration'),
        new RunEngineRoutine('run', 'Start and run engine'),
        new CleanOutputRoutine('cleanup', 'Display output and cleanup'),
      )
      .run(engineName, {
        configRoot,
        engine,
        engineName,
        root: process.cwd(),
      });
  }
}
