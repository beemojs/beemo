/* eslint-disable @typescript-eslint/no-explicit-any, max-classes-per-file */

import { Arguments, Argv, ArgList } from '@boost/args';
import { Path } from '@boost/common';
import { mockDebugger } from '@boost/debug/lib/testing';
import execa from 'execa';
import Driver from './Driver';
import Script from './Script';
import Tool from './Tool';
import { DriverMetadata } from './types';
import Context from './contexts/Context';
import ConfigContext from './contexts/ConfigContext';
import DriverContext, { DriverContextOptions } from './contexts/DriverContext';
import ScaffoldContext, { ScaffoldContextOptions } from './contexts/ScaffoldContext';
import ScriptContext, { ScriptContextOptions } from './contexts/ScriptContext';

export { mockDebugger };

export const BEEMO_TEST_ROOT = Path.resolve('../../../tests', __dirname);

export class TestDriver<O extends object = {}> extends Driver<O> {
  name = 'test-driver';
}

export class TestScript<O extends object = {}> extends Script<O> {
  name = 'test-script';

  execute(): any {
    return Promise.resolve();
  }
}

export function mockConsole<K extends keyof Console>(name: K): jest.SpyInstance {
  return jest.spyOn(console, name as 'log').mockImplementation(() => {});
}

export function mockTool(argv: Argv = []): Tool {
  const tool = new Tool({
    argv,
    cwd: BEEMO_TEST_ROOT,
  });

  // @ts-ignore
  tool.debug = mockDebugger();

  tool.config = {
    configure: {
      cleanup: false,
      parallel: true,
    },
    debug: false,
    drivers: [],
    execute: {
      concurrency: 1,
      graph: true,
    },
    module: '@local',
    scripts: [],
    settings: {},
  };

  tool.package = {
    name: 'beemo-test',
    version: '0.0.0',
  };

  return tool;
}

export function mockDriver<C extends object = {}>(
  name: string,
  tool: Tool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver<C> {
  const driver = new TestDriver<C>();

  driver.name = name;
  driver.tool = tool || mockTool();

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

  script.name = name;
  script.tool = tool || mockTool();

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

export function stubDriverArgs(
  fields?: Partial<DriverContextOptions>,
): Arguments<DriverContextOptions> {
  return stubArgs({
    concurrency: 1,
    graph: false,
    referenceWorkspaces: false,
    stdio: 'buffer',
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
    stdio: 'buffer',
    workspaces: '',
    ...fields,
  });
}

export function applyContext<T extends Context>(context: T): T {
  context.args = stubArgs({ a: true, foo: 'bar' }, ['baz']);
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.cwd = BEEMO_TEST_ROOT;
  context.configModuleRoot = BEEMO_TEST_ROOT;
  context.workspaceRoot = BEEMO_TEST_ROOT;
  context.workspaces = [];

  return context;
}

export function stubConfigContext(): ConfigContext {
  return applyContext(new ConfigContext(stubArgs({})));
}

export function stubDriverContext(driver?: Driver): DriverContext {
  return applyContext(new DriverContext(stubDriverArgs(), driver || new TestDriver()));
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
  return BEEMO_TEST_ROOT.append(part);
}

export function getRoot(): Path {
  return BEEMO_TEST_ROOT;
}

export function stubExecResult(fields?: Partial<execa.ExecaReturnValue>): execa.ExecaReturnValue {
  return {
    all: '',
    command: '',
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
