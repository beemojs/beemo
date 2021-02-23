import execa from 'execa';
import mergeWith from 'lodash/mergeWith';
import { Blueprint, isObject, optimal, Path, Predicates, predicates } from '@boost/common';
import { ConcurrentEvent, Event } from '@boost/event';
import { Plugin } from '@boost/plugin';
import {
  STRATEGY_COPY,
  STRATEGY_CREATE,
  STRATEGY_NATIVE,
  STRATEGY_NONE,
  STRATEGY_REFERENCE,
} from './constants';
import ConfigContext from './contexts/ConfigContext';
import DriverContext from './contexts/DriverContext';
import isClassInstance from './helpers/isClassInstance';
import Tool from './Tool';
import {
  Argv,
  BeemoTool,
  Driverable,
  DriverCommandOptions,
  DriverMetadata,
  DriverOptions,
  DriverOutput,
  DriverStrategy,
  Execution,
} from './types';

export default abstract class Driver<
    Config extends object = {},
    Options extends DriverOptions = DriverOptions
  >
  extends Plugin<BeemoTool, Options>
  implements Driverable {
  command: DriverCommandOptions = {};

  // Set after instantiation
  config!: Config;

  // Set after instantiation
  metadata!: DriverMetadata;

  // Set within a life-cycle
  tool!: Tool;

  output: DriverOutput = {
    stderr: '',
    stdout: '',
  };

  readonly onLoadProviderConfig = new Event<[ConfigContext, Path, Config]>('load-provider-config');

  readonly onLoadConsumerConfig = new Event<[ConfigContext, Config]>('load-consumer-config');

  readonly onMergeConfig = new Event<[ConfigContext, Config]>('merge-config');

  readonly onCreateConfigFile = new Event<[ConfigContext, Path, Config]>('create-config-file');

  readonly onCopyConfigFile = new Event<[ConfigContext, Path, Config]>('copy-config-file');

  readonly onReferenceConfigFile = new Event<[ConfigContext, Path, Config]>(
    'reference-config-file',
  );

  readonly onDeleteConfigFile = new Event<[ConfigContext, Path]>('delete-config-file');

  readonly onBeforeExecute = new ConcurrentEvent<[DriverContext, Argv]>('before-execute');

  readonly onAfterExecute = new ConcurrentEvent<[DriverContext, unknown]>('after-execute');

  readonly onFailedExecute = new ConcurrentEvent<[DriverContext, Error]>('failed-execute');

  static validate(driver: Driver) {
    const name = (isClassInstance(driver) && driver.constructor.name) || 'Driver';

    if (!isObject(driver.options)) {
      throw new Error(`\`${name}\` requires an options object.`);
    }
  }

  blueprint({ array, object, string }: Predicates): Blueprint<DriverOptions> {
    return {
      args: array(string()),
      dependencies: array(string()),
      env: object(string()),
      strategy: string(STRATEGY_NATIVE).oneOf<DriverStrategy>([
        STRATEGY_NATIVE,
        STRATEGY_CREATE,
        STRATEGY_REFERENCE,
        STRATEGY_COPY,
        STRATEGY_NONE,
      ]),
    };
  }

  bootstrap() {}

  startup(tool: Tool) {
    this.tool = tool;
    this.bootstrap();
  }

  /**
   * Special case for merging arrays.
   */
  doMerge(prevValue: unknown, nextValue: unknown): unknown {
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      return Array.from(new Set(prevValue.concat(nextValue)));
    }

    return undefined;
  }

  /**
   * Extract the error message when the driver fails to execute.
   */
  extractErrorMessage(error: { message: string }): string {
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
   * Return the module name without the Beemo namespace.
   */
  getName(): string {
    return this.name.split('-').pop()!;
  }

  /**
   * Return a list of user defined arguments.
   */
  getArgs(): Argv {
    return Array.isArray(this.options.args) ? this.options.args : [];
  }

  /**
   * Return a list of dependent drivers.
   */
  getDependencies(): string[] {
    const dependencies = Array.isArray(this.options.dependencies) ? this.options.dependencies : [];

    return [
      // Always required; configured by the driver
      ...this.metadata.dependencies,
      // Custom; configured by the consumer
      ...dependencies,
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
    const version = (execa.sync(bin, [versionOption])?.stdout || '').trim();
    const match = version.match(/(\d+)\.(\d+)\.(\d+)/u);

    return match ? match[0] : '0.0.0';
  }

  /**
   * Merge multiple configuration objects.
   */
  mergeConfig(prev: Config, next: Config): Config {
    return mergeWith(prev, next, this.doMerge);
  }

  /**
   * Handle command failures according to this driver.
   */
  processFailure(error: Execution) {
    const { stderr = '', stdout = '' } = error;
    const out = (stderr || stdout).trim();

    if (out) {
      this.setOutput('stderr', out);
    }
  }

  /**
   * Handle successful commands according to this driver.
   */
  processSuccess(response: Execution) {
    const { stderr = '', stdout = '' } = response;

    this.setOutput('stderr', stderr.trim());
    this.setOutput('stdout', stdout.trim());
  }

  /**
   * Setup additional command options.
   */
  setCommandOptions(options: DriverCommandOptions): this {
    const blueprint: Blueprint<DriverCommandOptions> = {};
    const { shape, string } = predicates;

    Object.keys(options).forEach((key) => {
      blueprint[key] = shape({
        description: string().notEmpty().required(),
        type: string().oneOf<'boolean' | 'number' | 'string'>(['string', 'number', 'boolean']),
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
    const { array, bool, string } = predicates;

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
        filterOptions: bool(true),
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

  /**
   * Store the raw output of the driver's execution.
   */
  setOutput(type: keyof DriverOutput, value: string): this {
    this.output[type] = value.trim();

    return this;
  }
}
