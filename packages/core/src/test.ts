import execa from 'execa';
import { ArgList, Arguments, Argv } from '@boost/args';
import { Path } from '@boost/common';
import { mockDebugger } from '@boost/debug/test';
import {
	ConfigContext,
	ConfigFile,
	Context,
	Driver,
	DriverContext,
	DriverContextOptions,
	DriverMetadata,
	ScaffoldContext,
	ScaffoldContextOptions,
	Script,
	ScriptContext,
	ScriptContextOptions,
	Tool,
} from '.';

export { mockDebugger };

const TEST_ROOT = new Path(process.env.BEEMO_TEST_ROOT ?? process.cwd());

export class TestDriver<O extends object = {}> extends Driver<O> {
	override readonly name = 'test-driver';
}

export class TestScript<O extends object = {}> extends Script<O> {
	override readonly name = 'test-script';

	execute(): any {
		return Promise.resolve();
	}
}

export function mockConsole<K extends keyof Console>(name: K): jest.SpyInstance {
	return jest.spyOn(console, name as 'log').mockImplementation(() => {});
}

export function mockToolConfig(): ConfigFile {
	return {
		configure: {
			cleanup: false,
			parallel: true,
		},
		debug: false,
		drivers: [],
		execute: {
			concurrency: 1,
			graph: true,
			output: '',
		},
		module: '@local',
		scripts: [],
		settings: {},
	};
}

export function mockTool(argv: Argv = []): Tool {
	const tool = new Tool({
		argv,
		cwd: TEST_ROOT,
	});

	// @ts-expect-error Allow readonly
	tool.debug = mockDebugger();

	tool.config = mockToolConfig();

	return tool;
}

export function mockDriver<C extends object = {}>(
	name: string,
	tool: Tool | null = null,
	metadata: Partial<DriverMetadata> = {},
): Driver<C> {
	const driver = new TestDriver<C>();

	// @ts-expect-error For testing purposes
	driver.name = name;
	driver.tool = tool ?? mockTool();

	driver.setMetadata({
		bin: name.toLowerCase(),
		configName: `${name}.json`,
		title: name,
		...metadata,
	});

	return driver;
}

export function mockScript(name: string, tool: Tool | null = null): Script<{}> {
	const script = new TestScript<{}>();

	// @ts-expect-error For testing purposes
	script.name = name;
	script.tool = tool ?? mockTool();

	return script;
}

export function stubArgs<T extends object>(options: T, params: ArgList = []): Arguments<T> {
	return {
		command: [],
		errors: [],
		options,
		params,
		rest: [],
		unknown: {},
	};
}

export function stubConfigArgs(): Arguments<{}> {
	return stubArgs({});
}

export function stubDriverArgs(
	fields?: Partial<DriverContextOptions>,
): Arguments<DriverContextOptions> {
	return stubArgs({
		concurrency: 1,
		graph: false,
		workspaces: '',
		...fields,
	});
}

export function stubScaffoldArgs(
	fields?: Partial<ScaffoldContextOptions>,
): Arguments<ScaffoldContextOptions> {
	return stubArgs({
		dry: false,
		...fields,
	});
}

export function stubScriptArgs(
	fields?: Partial<ScriptContextOptions>,
): Arguments<ScriptContextOptions> {
	return stubArgs({
		concurrency: 1,
		graph: false,
		workspaces: '',
		...fields,
	});
}

export function applyContext<T extends Context>(context: T): T {
	context.args = stubArgs({ a: true, foo: 'bar' }, ['baz']);
	context.argv = ['-a', '--foo', 'bar', 'baz'];
	context.cwd = TEST_ROOT;
	context.configModuleRoot = TEST_ROOT;
	context.workspaceRoot = TEST_ROOT;
	context.workspaces = [];

	return context;
}

export function stubConfigContext(): ConfigContext {
	return applyContext(new ConfigContext(stubArgs({})));
}

export function stubDriverContext(driver?: Driver): DriverContext {
	return applyContext(new DriverContext(stubDriverArgs(), driver ?? new TestDriver()));
}

export function stubScriptContext(script?: Script): ScriptContext {
	const context = applyContext(new ScriptContext(stubScriptArgs(), 'script'));

	if (script) {
		context.setScript(script);
	}

	return context;
}

export function stubScaffoldContext(
	generator: string = 'generator',
	action: string = 'action',
	name: string = '',
): ScaffoldContext {
	return applyContext(new ScaffoldContext(stubScaffoldArgs(), generator, action, name));
}

export function prependRoot(part: string): Path {
	return TEST_ROOT.append(part);
}

export function getRoot(): Path {
	return TEST_ROOT;
}

export function stubExecResult(fields?: Partial<execa.ExecaReturnValue>): execa.ExecaReturnValue {
	return {
		all: '',
		command: '',
		escapedCommand: '',
		exitCode: 0,
		failed: false,
		isCanceled: false,
		killed: false,
		signal: undefined,
		stderr: '',
		stdout: '',
		timedOut: false,
		...fields,
	};
}
