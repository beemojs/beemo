import { Driver } from '../Driver';
import { Arguments, Argv } from '../types';
import { ConfigContext } from './ConfigContext';

export interface DriverContextOptions {
	concurrency: number;
	graph: boolean;
	workspaces: string;
}

export type DriverContextParams = [string];

export class DriverContext<
	O extends DriverContextOptions = DriverContextOptions,
> extends ConfigContext<O> {
	// Name defined on the plugin (kebab case)
	driverName: string = '';

	// Nested list of argv for each parallel execution
	parallelArgv: Argv[] = [];

	// The primary driver that initiated the pipeline
	primaryDriver: Driver;

	constructor(args: Arguments<O>, driver: Driver, parallelArgv: Argv[] = []) {
		super(args);

		this.driverName = driver.getName();
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
