/* eslint-disable @typescript-eslint/no-explicit-any */

import { Path, FilePath } from '@boost/common';
import { Context as BaseContext } from '@boost/core';
import camelCase from 'lodash/camelCase';
import trim from 'lodash/trim';
import { Arguments, Argv } from '../types';

export interface ConfigPath {
  driver: string;
  path: Path;
}

export default class Context<T = {}> extends BaseContext {
  args: Arguments<T>;

  argv: Argv = [];

  configPaths: ConfigPath[] = [];

  // Current working directory
  cwd!: Path;

  // Absolute path to the configuration module
  moduleRoot!: Path;

  // Absolute path to the folder containing `package.json` (Yarn workspaces) or `lerna.json`
  workspaceRoot!: Path;

  // List of paths (with trailing glob star) for each defined workspace
  workspaces: FilePath[] = [];

  constructor(args: Arguments<T>) {
    super();

    this.args = args;
  }

  /**
   * Add a positional argument to the argv list.
   */
  addArg(arg: string): this {
    this.args._.push(arg);
    this.argv.push(arg);

    return this;
  }

  /**
   * Add multiple positional arguments.
   */
  addArgs(args: string[]): this {
    args.forEach((arg) => {
      this.addArg(arg);
    });

    return this;
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
   */
  addOption(arg: string, defaultValue: unknown = true, useEquals: boolean = false): this {
    const list = [];
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

    (this.args as any)[name] = value;
    (this.args as any)[camelCase(name)] = value;

    if (typeof value === 'boolean' || !value) {
      list.push(option);
    } else if (useEquals) {
      list.push(`${option}=${value}`);
    } else {
      list.push(option, String(value));
    }

    this.argv.push(...list);

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
   * Find a configuration path by file name.
   */
  findConfigByName(name: string): ConfigPath | undefined {
    return this.configPaths.find(
      (config) => String(config.path).endsWith(name) || config.driver === name,
    );
  }

  /**
   * Return an argument or option value by name, or a fallback value if not found.
   */
  getArg(name: string, fallback?: unknown): unknown {
    return this.args[name] || fallback || null;
  }
}
