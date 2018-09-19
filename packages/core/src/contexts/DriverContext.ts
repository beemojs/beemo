/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import Driver from '../Driver';
import { Arguments, Argv } from '../types';

export default class DriverContext extends Context {
  configPaths: string[] = [];

  driverName: string = '';

  drivers: Set<Driver<any>> = new Set();

  parallelArgv: Argv[] = [];

  primaryDriver: Driver<any>;

  workspaceRoot: string = '';

  workspaces: string[] = [];

  constructor(args: Arguments, driver: Driver<any>, parallelArgv: Argv[] = []) {
    super(args);

    this.driverName = driver.name;
    this.parallelArgv = parallelArgv;
    this.primaryDriver = driver;

    // Make the context available in the current driver
    driver.context = this;
  }

  /**
   * Add a driver as a dependency.
   */
  addDriverDependency(driver: Driver<any>): this {
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

  /**
   * Find a configuration path by file name.
   */
  findConfigByName(fileName: string): string | undefined {
    return this.configPaths.find(path => path.endsWith(fileName));
  }
}
