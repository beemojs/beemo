/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import kebabCase from 'lodash/kebabCase';
import Context from './Context';
import Driver from '../Driver';
import { Arguments, Argv } from '../types';

export interface DriverArgs {
  concurrency: number;
  name: string;
  names?: string[];
  priority: boolean;
  workspaces: string;
}

export default class DriverContext<T = DriverArgs> extends Context<T> {
  driverName: string = '';

  // List of drivers involved in the current pipeline
  drivers: Set<Driver> = new Set();

  eventName: string;

  parallelArgv: Argv[] = [];

  // The primary driver that initiated the pipeline
  primaryDriver: Driver;

  constructor(args: Arguments<T>, driver: Driver, parallelArgv: Argv[] = []) {
    super(args);

    this.driverName = driver.name;
    this.eventName = kebabCase(driver.name);
    this.parallelArgv = parallelArgv;
    this.primaryDriver = driver;

    // Add primary driver to driver list
    this.drivers.add(driver);
  }

  /**
   * Add a driver as a dependency.
   */
  addDriverDependency(driver: Driver): this {
    if (driver instanceof Driver) {
      this.drivers.add(driver);
    } else {
      throw new TypeError('Invalid driver. Must be an instance of `Driver`.');
    }

    return this;
  }

  /**
   * Add a parallel command with additional argv.
   */
  addParallelCommand(argv: Argv): this {
    this.parallelArgv.push(argv);

    return this;
  }
}
