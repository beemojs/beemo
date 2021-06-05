import { Tool } from '@beemo/core';
import { Program } from '@boost/cli';

describe('CLI (branded)', () => {
	it('can brand the name, bin, and docs', async () => {
		process.env.BEEMO_BRAND_NAME = 'BMO';
		process.env.BEEMO_BRAND_BINARY = 'bmo';
		process.env.BEEMO_MANUAL_URL = 'https://bmo.dev';

		const { tool, program } = await import('../src/setup');

		expect(tool.options.projectName).toBe('bmo');
		expect(tool).toBeInstanceOf(Tool);

		expect(program.options.bin).toBe('bmo');
		expect(program.options.name).toBe('BMO');
		expect(program.options.footer).toEqual(expect.stringContaining('bmo.dev'));
		expect(program).toBeInstanceOf(Program);

		expect(process.env.BOOSTJS_DEBUG_NAMESPACE).toBe('bmo');
	});
});
