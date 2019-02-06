import kebabCase from 'lodash/kebabCase';
import ConfigContext from './ConfigContext';
import Driver from '../Driver';
import { Arguments, Argv } from '../types';

export interface DriverArgs {
  concurrency: number;
  live: boolean;
  name: string;
  priority: boolean;
  workspaces: string;
}

export default class DriverContext<T = DriverArgs> extends ConfigContext<T> {
  driverName: string = '';

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
   * Add a parallel command with additional argv.
   */
  addParallelCommand(argv: Argv): this {
    this.parallelArgv.push(argv);

    return this;
  }
}
