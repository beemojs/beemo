import { ScriptContext } from '../../src/contexts/ScriptContext';
import { mockScript, stubScriptArgs } from '../../src/test';

describe('ScriptContext', () => {
	let context: ScriptContext;

	beforeEach(() => {
		context = new ScriptContext(stubScriptArgs(), 'foo');
	});

	describe('constructor()', () => {
		it('sets args', () => {
			context = new ScriptContext(stubScriptArgs({ graph: true }), 'foo');

			expect(context.args).toEqual(stubScriptArgs({ graph: true }));
		});

		it('sets script name', () => {
			expect(context.scriptName).toBe('foo');
		});

		it('converts name to correct case', () => {
			context = new ScriptContext(stubScriptArgs(), 'foo-bar');

			expect(context.scriptName).toBe('foo-bar');
		});
	});

	describe('setScript()', () => {
		it('sets script object, name, and path', () => {
			const script = mockScript('foo');

			context.setScript(script);

			expect(context.script).toBe(script);
		});
	});
});
