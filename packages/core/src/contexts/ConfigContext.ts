import { Driver } from '../Driver';
import { Context } from './Context';

export class ConfigContext<O extends object = {}> extends Context<O, string[]> {
	// List of drivers involved in the current pipeline
	drivers: Set<Driver> = new Set();

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
}
