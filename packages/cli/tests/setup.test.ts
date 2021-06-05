import { Tool } from '@beemo/core';
import { Program } from '@boost/cli';
import { program, tool } from '../src/setup';

describe('CLI', () => {
	it('defines default beemo branding', () => {
		expect(tool.options.projectName).toBe('beemo');
		expect(tool).toBeInstanceOf(Tool);

		expect(program.options.bin).toBe('beemo');
		expect(program.options.name).toBe('Beemo');
		expect(program).toBeInstanceOf(Program);

		expect(process.env.BOOSTJS_DEBUG_NAMESPACE).toBe('beemo');
	});
});
