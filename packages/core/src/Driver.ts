import { Plugin, EventListener, Predicates } from '@boost/core';
import { Event, ConcurrentEvent } from '@boost/event';
import mergeWith from 'lodash/mergeWith';
import execa from 'execa';
import optimal, { array, bool, object, string, shape } from 'optimal';
import DriverContext from './contexts/DriverContext';
import ConfigContext from './contexts/ConfigContext';
import {
  STRATEGY_COPY,
  STRATEGY_CREATE,
  STRATEGY_REFERENCE,
  STRATEGY_NATIVE,
  STRATEGY_NONE,
} from './constants';
import { Argv, DriverCommandOptions, DriverOptions, DriverMetadata, Execution } from './types';

export default abstract class Driver<
  Config extends object = {},
  Options extends DriverOptions = DriverOptions
> extends Plugin<Options> {
  command: DriverCommandOptions = {};

  // @ts-ignore Set after instantiation
  config: Config;

  // @ts-ignore Set after instantiation
  metadata: DriverMetadata;

  onLoadModuleConfig = new Event<[ConfigContext, string, Config]>('load-module-config');

  onLoadPackageConfig = new Event<[ConfigContext, Config]>('load-package-config');

  onMergeConfig = new Event<[ConfigContext, Config]>('merge-config');

  onCreateConfigFile = new Event<[ConfigContext, string, Config]>('create-config-file');

  onCopyConfigFile = new Event<[ConfigContext, string, Config]>('copy-config-file');

  onReferenceConfigFile = new Event<[ConfigContext, string, Config]>('reference-config-file');

  onDeleteConfigFile = new Event<[ConfigContext, string]>('delete-config-file');

  onBeforeExecute = new ConcurrentEvent<[DriverContext, Argv]>('before-execute');

  onAfterExecute = new ConcurrentEvent<[DriverContext, unknown]>('after-execute');

  onFailedExecute = new ConcurrentEvent<[DriverContext, Error]>('failed-execute');

  blueprint(predicates: Predicates) /* infer */ {
    return {
      args: array(string()),
      dependencies: array(string()),
      env: object(string()),
      strategy: string(STRATEGY_NATIVE).oneOf([
        STRATEGY_NATIVE,
        STRATEGY_CREATE,
        STRATEGY_REFERENCE,
        STRATEGY_COPY,
        STRATEGY_NONE,
      ]),
    } as FixMe;
  }

  /**
   * Extract the error message when the driver fails to execute.
   */
  extractErrorMessage(error: Error): string {
    return error.message.split('\n', 1)[0] || '';
  }

  /**
   * Format the configuration file before it's written.
   */
  formatConfig(data: Config): string {
    const content = JSON.stringify(data, null, 2);

    if (this.metadata.configName.endsWith('.js')) {
      return `module.exports = ${content};`;
    }

    return content;
  }

  /**
   * Return a list of user defined arguments.
   */
  getArgs(): Argv {
    return Array.from(this.options.args!);
  }

  /**
   * Return a list of dependent drivers.
   */
  getDependencies(): string[] {
    return [
      // Always required; configured by the driver
      ...this.metadata.dependencies,
      // Custom; configured by the consumer
      ...Array.from(this.options.dependencies!),
    ];
  }

  /**
   * Return a list of supported CLI options.
   */
  getSupportedOptions(): string[] {
    return [];
  }

  /**
   * Extract the current version of the installed driver via its binary.
   */
  getVersion(): string {
    const { bin, versionOption } = this.metadata;
    const version = execa.sync(bin, [versionOption]).stdout.trim();
    const match = version.match(/(\d+)\.(\d+)\.(\d+)/u);

    return match ? match[0] : '0.0.0';
  }

  /**
   * Handle command failures according to this driver.
   */
  handleFailure(error: Execution) {
    const { stderr, stdout } = error;
    const out = (stderr || stdout).trim();

    // Integration debugging
    // this.tool.logError('STDERR', JSON.stringify(error));

    // Use console to by pass silent
    if (out) {
      this.tool.logError(out);
    }
  }

  /**
   * Handle successful commands according to this driver.
   */
  handleSuccess(response: Execution) {
    const out = response.stdout.trim();

    // Integration debugging
    // this.tool.log('STDOUT', JSON.stringify(response));

    // Use console to by pass silent
    if (out) {
      this.tool.log(out);
    }
  }

  /**
   * Special case for merging arrays.
   */
  handleMerge(prevValue: any, nextValue: any): any {
    if (Array.isArray(prevValue)) {
      return prevValue.concat(nextValue);
    }

    return undefined;
  }

  /**
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: Config, next: Config): Config {
    return mergeWith(prev, next, this.handleMerge);
  }

  /**
   * Easily register events in the tool.
   */
  on(eventName: string, listener: EventListener): this {
    this.tool.on(eventName, listener);

    return this;
  }

  /**
   * Setup additional command options.
   */
  setCommandOptions(options: DriverCommandOptions): this {
    const blueprint: any = {};

    Object.keys(options).forEach(key => {
      blueprint[key] = shape({
        description: string()
          .notEmpty()
          .required(),
      });
    });

    this.command = optimal(options, blueprint, {
      name: this.constructor.name,
      unknown: true,
    });

    return this;
  }

  /**
   * Set metadata about the binary/executable in which this driver wraps.
   */
  setMetadata(metadata: Partial<DriverMetadata>): this {
    this.metadata = optimal(
      metadata,
      {
        bin: string()
          .match(/^[a-z]{1}[a-zA-Z0-9-]+$/u)
          .required(),
        configName: string().required(),
        configOption: string('--config'),
        configStrategy: string(STRATEGY_CREATE).oneOf([
          STRATEGY_CREATE,
          STRATEGY_REFERENCE,
          STRATEGY_COPY,
        ]),
        dependencies: array(string()),
        description: string(),
        filterOptions: bool(false),
        helpOption: string('--help'),
        title: string().required(),
        useConfigOption: bool(),
        versionOption: string('--version'),
        watchOptions: array(string()),
        workspaceStrategy: string(STRATEGY_REFERENCE).oneOf([STRATEGY_REFERENCE, STRATEGY_COPY]),
      },
      {
        name: this.constructor.name,
      },
    );

    return this;
  }
}
