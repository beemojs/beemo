import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import { Argv as Yargv } from 'yargs';
import { Event } from '@boost/event';
import { Path, requireModule } from '@boost/common';
import { CLI, Pipeline, Tool } from '@boost/core';
import { bool, number, string, shape } from 'optimal';
import CleanupConfigsRoutine from './routines/CleanupConfigsRoutine';
import ResolveConfigsRoutine from './routines/ResolveConfigsRoutine';
import RunDriverRoutine from './routines/RunDriverRoutine';
import RunScriptRoutine from './routines/RunScriptRoutine';
import ScaffoldRoutine from './routines/ScaffoldRoutine';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext from './contexts/ConfigContext';
import DriverContext from './contexts/DriverContext';
import ScriptContext from './contexts/ScriptContext';
import ScaffoldContext from './contexts/ScaffoldContext';
import { KEBAB_PATTERN } from './constants';
import { Argv, Execution, BeemoConfig, BeemoPluginRegistry, DriverOptions } from './types';

export function configBlueprint() {
  return {
    configure: shape({
      cleanup: bool(false),
      parallel: bool(true),
    }),
    execute: shape({
      concurrency: number(),
      graph: bool(true),
    }),
    module: process.env.BEEMO_CONFIG_MODULE
      ? string(process.env.BEEMO_CONFIG_MODULE)
      : string().required(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class Beemo<T = any> extends Tool<BeemoPluginRegistry, BeemoConfig<T>> {
  moduleRoot?: Path;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipeline: Pipeline<any, Beemo<T>> | null = null;

  onResolveDependencies = new Event<[ConfigContext, Driver<object, DriverOptions>[]]>(
    'resolve-dependencies',
  );

  onRunConfig = new Event<[ConfigContext, string[]]>('run-config');

  onRunDriver = new Event<[DriverContext, Driver<object, DriverOptions>]>('run-driver');

  onRunScript = new Event<[ScriptContext]>('run-script');

  constructor(argv: Argv, binName?: string, testingOnly: boolean = false) {
    super(
      {
        appName: 'beemo',
        appPath: path.join(__dirname, '..'),
        configBlueprint: configBlueprint(),
        configName: binName || 'beemo',
        scoped: true,
      },
      argv,
    );

    // Abort early for testing purposes
    if (testingOnly) {
      return;
    }

    this.initialize();

    // Set footer after messages have been loaded
    const footer = this.msg('app:poweredBy', { version });

    this.options.footer = `\n${this.isCI() ? '' : '🤖  '}${footer}`;
  }

  /**
   * Create a configuration file for the specified driver names.
   */
  async createConfigFiles(
    args: ConfigContext['args'],
    driverNames: string[] = [],
  ): Promise<unknown> {
    const context = this.prepareContext(new ConfigContext(args));

    // Create for all enabled drivers
    if (driverNames.length === 0) {
      this.getPlugins('driver').forEach((driver) => {
        context.addDriverDependency(driver);
        driverNames.push(driver.name);
      });

      this.debug('Running with all drivers');

      // Create for one or many driver
    } else {
      driverNames.forEach((driverName) => {
        context.addDriverDependency(this.getPlugin('driver', driverName));
      });

      this.debug('Running with %s driver(s)', driverNames.join(', '));
    }

    this.onRunConfig.emit([context, driverNames]);

    return this.startPipeline(context)
      .pipe(new ResolveConfigsRoutine('config', this.msg('app:configGenerate')))
      .run();
  }

  /**
   * Execute all routines for the chosen driver.
   */
  async runDriver(
    args: DriverContext['args'],
    driverName: string,
    parallelArgv: Argv[] = [],
  ): Promise<Execution[]> {
    const driver = this.getPlugin('driver', driverName);
    const context = this.prepareContext(new DriverContext(args, driver, parallelArgv));
    const version = driver.getVersion();

    this.onRunDriver.emit([context, driver], driverName);

    this.debug('Running with %s v%s driver', driverName, version);

    const pipeline = this.startPipeline(context)
      .pipe(new ResolveConfigsRoutine('config', this.msg('app:configGenerate')))
      .pipe(
        new RunDriverRoutine(
          'driver',
          this.msg('app:driverRun', {
            name: driver.metadata.title,
            version,
          }),
        ),
      );

    // Only add cleanup routine if we need it
    if (this.config.configure.cleanup) {
      pipeline.pipe(new CleanupConfigsRoutine('cleanup', this.msg('app:cleanup')));
    }

    return pipeline.run(driverName);
  }

  /**
   * Run a script found within the configuration module.
   */
  async runScript(args: ScriptContext['args'], scriptName: string): Promise<Execution> {
    if (!scriptName || !scriptName.match(KEBAB_PATTERN)) {
      throw new Error(this.msg('errors:scriptNameInvalidFormat'));
    }

    const context = this.prepareContext(new ScriptContext(args, scriptName));

    this.onRunScript.emit([context], scriptName);

    this.debug('Running with %s script', context.scriptName);

    return this.startPipeline(context)
      .pipe(
        new RunScriptRoutine(
          'script',
          // Try and match the name of the class
          this.msg('app:scriptRun', { name: upperFirst(camelCase(context.scriptName)) }),
        ),
      )
      .run();
  }

  /**
   * Delete config files if a process fails.
   */
  private handleCleanupOnFailure(code: number, context: Context) {
    if (code === 0) {
      return;
    }

    // Must not be async!
    if (Array.isArray(context.configPaths)) {
      context.configPaths.forEach((config) => {
        fs.removeSync(config.path.path());
      });
    }
  }
}
