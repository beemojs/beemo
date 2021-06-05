import { MochaConfig } from '@beemo/driver-mocha';

const config: MochaConfig = {
	checkLeaks: true,
	colors: true,
	fullTrace: true,
	reporter: 'nyan',
};

export default config;
