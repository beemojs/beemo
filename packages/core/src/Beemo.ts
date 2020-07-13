import fs from 'fs-extra';
import path from 'path';
import { Event } from '@boost/event';
import { bool, number, string, shape } from 'optimal';
import CleanupConfigsRoutine from './routines/CleanupConfigsRoutine';
import ResolveConfigsRoutine from './routines/ResolveConfigsRoutine';
import RunDriverRoutine from './routines/RunDriverRoutine';
import Driver from './Driver';
import Context from './contexts/Context';
import DriverContext from './contexts/DriverContext';
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
  onRunDriver = new Event<[DriverContext, Driver<object, DriverOptions>]>('run-driver');

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
