/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import Driver from '../Driver';
import { Arguments } from '../types';

export default class DriverContext extends Context {
  configPaths: string[] = [];

  driverName: string = '';

  drivers: Driver<any>[] = [];

  primaryDriver: Driver<any>;

  workspaceRoot: string = '';

  workspaces: string[] = [];

  constructor(args: Arguments, driver: Driver<any>) {
    super(args);

    this.primaryDriver = driver;
    this.driverName = driver.name;

    // Make the context available in the current driver
    driver.context = this;
  }

  /**
   * Add a driver as a dependency.
   */
  addDriverDependency(driver: Driver<any>): void {
    if (driver instanceof Driver) {
      this.drivers.push(driver);
    } else {
      throw new TypeError('Invalid driver. Must be an instance of `Driver`.');
    }
  }

  /**
   * Find a configuration path by file name.
   */
  findConfigByName(fileName: string): string | undefined {
    return this.configPaths.find(path => path.endsWith(fileName));
  }
}
