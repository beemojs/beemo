/* eslint-disable max-classes-per-file */

import path from 'path';
import execa from 'execa';
import { Arguments } from 'yargs';
import parseArgs from 'yargs-parser';
import { mockDebugger, stubArgs, stubToolConfig } from '@boost/core/test-utils';
import Beemo from './Beemo';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext, { ConfigArgs } from './contexts/ConfigContext';
import DriverContext, { DriverArgs } from './contexts/DriverContext';
import ScaffoldContext, { ScaffoldArgs } from './contexts/ScaffoldContext';
import ScriptContext, { ScriptArgs } from './contexts/ScriptContext';
import { DriverMetadata, Argv, BeemoConfig } from './types';

export { mockDebugger, stubArgs };

export class TestDriver<T extends object = {}> extends Driver<T> {
  name = 'test-driver';
}

export class TestScript<A extends object = {}, T extends object = {}> extends Script<A, T> {
  name = 'test-script';

  blueprint() {
    return {} as $FixMe;
  }
}

// Use core package since resources are located here
export const BEEMO_APP_PATH = path.join(__dirname, '..');

// Use a folder that should not cause issues / contain much code
export const BEEMO_TEST_ROOT = path.join(__dirname, '../../../tests');

export function mockTool(argv: Argv = []): Beemo {
  const tool = new Beemo(argv, '', true);

  Object.assign(tool.options, {
    appName: 'beemo',
    appPath: BEEMO_APP_PATH,
    root: BEEMO_TEST_ROOT,
    workspaceRoot: BEEMO_TEST_ROOT,
  });

  tool.config = stubToolConfig<BeemoConfig>({
    configure: {
      cleanup: false,
      parallel: true,
    },
    drivers: [],
    execute: {
      concurrency: 0,
      graph: true,
    },
    scripts: [],
  });

  return tool;
}

export function mockDriver<C extends object = {}>(
  name: string,
  tool: Beemo | null = null,
  metadata: Partial<DriverMetadata> = {},
  boot: boolean = true,
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

  if (boot) {
    driver.bootstrap();
  }

  return driver;
}

export function mockScript<C extends object = {}>(
  name: string,
  tool: Beemo | null = null,
): Script<{}, C> {
  const script = new TestScript<{}, C>();

  script.name = name;
  script.tool = tool || mockTool();

  return script;
}

export function applyContext<T extends Context>(context: T): T {
  context.args = parseArgs(['-a', '--foo', 'bar', 'baz']);
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.cwd = BEEMO_TEST_ROOT;
  context.moduleRoot = BEEMO_TEST_ROOT;
  context.workspaceRoot = BEEMO_TEST_ROOT;
  context.workspaces = [];

  return context;
}

export function stubContext(): Context {
  return applyContext(new Context(stubArgs()));
}

export function stubConfigArgs(fields?: Partial<ConfigArgs>): Arguments<ConfigArgs> {
  return stubArgs({
    names: [],
    ...fields,
  });
}

export function stubConfigContext(): ConfigContext {
  return applyContext(new ConfigContext(stubConfigArgs()));
}

export function stubDriverArgs(fields?: Partial<DriverArgs>): Arguments<DriverArgs> {
  return stubArgs({
    concurrency: 1,
    graph: false,
    stdio: 'buffer',
    workspaces: '',
    ...fields,
  });
}

export function stubDriverContext(driver?: Driver): DriverContext {
  return applyContext(new DriverContext(stubDriverArgs(), driver || new TestDriver()));
}

export function stubScaffoldArgs(fields?: Partial<ScaffoldArgs>): Arguments<ScaffoldArgs> {
  return stubArgs({
    action: '',
    dry: false,
    generator: '',
    name: '',
    ...fields,
  });
}

export function stubScaffoldContext(
  generator: string = 'generator',
  action: string = 'action',
  name: string = '',
): ScaffoldContext {
  return applyContext(new ScaffoldContext(stubScaffoldArgs(), generator, action, name));
}

export function stubScriptArgs(fields?: Partial<ScriptArgs>): Arguments<ScriptArgs> {
  return stubArgs({
    concurrency: 1,
    graph: false,
    name: 'foo',
    stdio: 'buffer',
    workspaces: '',
    ...fields,
  });
}

export function stubScriptContext(script?: Script): ScriptContext {
  const context = applyContext(new ScriptContext(stubScriptArgs(), 'script'));

  if (script) {
    context.setScript(script, './script.js');
  }

  return context;
}

export function stubExecResult(fields?: Partial<execa.ExecaReturnValue>): execa.ExecaReturnValue {
  return {
    all: '',
    command: '',
    exitCode: 0,
    exitCodeName: '',
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

export function prependRoot(part: string): string {
  return path.join(BEEMO_TEST_ROOT, part);
}

export function getRoot(): string {
  return BEEMO_TEST_ROOT;
}
