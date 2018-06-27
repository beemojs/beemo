/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import Driver from '../Driver';
import { Arguments } from '../types';

export default class DriverContext<T = any> extends Context {
  configPaths: string[] = [];

  driverName: string = '';

  drivers: Driver<any>[] = [];

  primaryDriver: Driver<T>;

  workspaceRoot: string = '';

  workspaces: string[] = [];

  constructor(args: Arguments, driver: Driver<T>) {
    super(args);

    this.primaryDriver = driver;
    this.driverName = driver.name;
    this.drivers.push(driver);

    // Make the context available in the current driver
    driver.context = this;
  }

  addDriver() {}
}
