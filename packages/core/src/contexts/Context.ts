import camelCase from 'lodash/camelCase';
import trim from 'lodash/trim';
import { PrimitiveType } from '@boost/args';
import { FilePath,Path } from '@boost/common';
import { Context as BaseContext } from '@boost/pipeline';
import { Arguments, Argv } from '../types';

export interface ConfigPath {
  driver: string;
  path: Path;
}

export default class Context<
  O extends object = {},
  P extends PrimitiveType[] = PrimitiveType[]
> extends BaseContext {
  // Parsed command line arguments as an object
  args: Arguments<O, P>;

  // Raw command line arguments as a list of strings
  argv: Argv;

  // List of driver configs currently registered
  configPaths: ConfigPath[] = [];

  // Current working directory
  cwd!: Path;

  // Absolute path to the configuration module
  configModuleRoot!: Path;

  // Absolute path to the folder containing `package.json` (Yarn workspaces) or `lerna.json`
  workspaceRoot!: Path;

  // List of paths (with trailing glob star) for each defined workspace
  workspaces: FilePath[] = [];

  constructor(args: Arguments<O, P>, argv: Argv = []) {
    super();

    this.args = args;
    this.argv = argv;

    // TODO MIGRATE
    // @ts-expect-error
    this.addArg = this.addParam.bind(this);
    // @ts-expect-error
    this.addArgs = this.addParams.bind(this);
  }

  /**
   * Add a config path for the defined driver.
   */
  addConfigPath(driverName: string, path: Path): this {
    this.configPaths.push({
      driver: driverName,
      path,
    });

    return this;
  }

  /**
   * Add an option argument to both the args object and argv list.
   * If the option is not supported, it will be added to the unknown options object.
   */
  addOption(arg: string, defaultValue: PrimitiveType = true, useEquals: boolean = false): this {
    let option = arg;
    let value = defaultValue;

    if (option.includes('=')) {
      [option, value] = option.split('=');
      useEquals = true;
    }

    let name = trim(option, '-');

    if (name.startsWith('no-')) {
      name = name.slice(3);
      value = false;
    }

    const optName = camelCase(name);

    if (optName in this.args.options) {
      // @ts-expect-error Allow this
      this.args.options[optName] = value;
    } else {
      this.args.unknown[optName] = String(value);
    }

    if (typeof value === 'boolean' || !value) {
      this.argv.push(option);
    } else if (useEquals) {
      this.argv.push(`${option}=${value}`);
    } else {
      this.argv.push(option, String(value));
    }

    return this;
  }

  /**
   * Add multiple boolean option arguments.
   */
  addOptions(args: string[]): this {
    args.forEach((arg) => {
      this.addOption(arg);
    });

    return this;
  }

  /**
   * Add a parameter to the argv list.
   */
  addParam(arg: string): this {
    this.args.params.push(arg);
    this.argv.push(arg);

    return this;
  }

  /**
   * Add multiple parameters.
   */
  addParams(args: string[]): this {
    args.forEach((arg) => {
      this.addParam(arg);
    });

    return this;
  }

  /**
   * Find a configuration path by file name.
   */
  findConfigByName(name: string): ConfigPath | undefined {
    return this.configPaths.find(
      (config) => String(config.path).endsWith(name) || config.driver === name,
    );
  }

  /**
   * Return a configured option value by name, or a fallback value if not found.
   */
  getOption<K extends keyof O>(name: K, fallback?: O[K]): O[K] | null {
    return this.args.options[name] || fallback || null;
  }

  /**
   * Return either a configured option value, or an unknown option value,
   * or null if not found.
   */
  getRiskyOption(name: string): PrimitiveType | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.getOption(name as keyof O) ?? this.args.unknown[name] ?? null) as any;
  }
}
