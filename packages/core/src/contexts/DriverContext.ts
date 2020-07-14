import ConfigContext from './ConfigContext';
import Driver from '../Driver';
import { Arguments, Argv, StdioType } from '../types';

export interface DriverContextOptions {
  concurrency: number;
  graph: boolean;
  stdio: StdioType;
  workspaces: string;
}

export default class DriverContext extends ConfigContext<DriverContextOptions> {
  // Name defined on the plugin (kebab case)
  driverName: string = '';

  // Nested list of argv for each parallel execution
  parallelArgv: Argv[] = [];

  // The primary driver that initiated the pipeline
  primaryDriver: Driver;

  constructor(args: Arguments<DriverContextOptions>, driver: Driver, parallelArgv: Argv[] = []) {
    super(args);

    this.driverName = driver.name;
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
