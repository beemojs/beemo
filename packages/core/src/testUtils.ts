import path from 'path';
import { Tool } from '@boost/core';
import parseArgs from 'yargs-parser';
import { mockDebugger, stubArgs, stubToolConfig, stubPackageJson } from '@boost/core/test-utils';
import Driver from './Driver';
import Script from './Script';
import Context from './contexts/Context';
import ConfigContext, { ConfigArgs } from './contexts/ConfigContext';
import DriverContext, { DriverArgs } from './contexts/DriverContext';
import ScaffoldContext, { ScaffoldArgs } from './contexts/ScaffoldContext';
import ScriptContext, { ScriptArgs } from './contexts/ScriptContext';
import { BeemoTool, BeemoConfig, BeemoPluginRegistry, DriverMetadata } from './types';

export const TEST_FIXTURE_ROOT = path.join(__dirname, '../../../tests/fixtures/app');

export { mockDebugger, stubArgs };

export function mockTool(): BeemoTool {
  const tool = new Tool<BeemoPluginRegistry, BeemoConfig>({
    appName: 'beemo',
    appPath: path.join(__dirname, '..'),
    configBlueprint: {},
    configName: 'beemo',
    root: TEST_FIXTURE_ROOT,
    scoped: true,
    workspaceRoot: TEST_FIXTURE_ROOT,
  });

  tool.config = stubToolConfig({
    configure: {
      cleanup: false,
      parallel: true,
    },
    drivers: [],
    execute: {
      concurrency: 0,
      priority: true,
    },
    reporters: [],
    scripts: [],
  });

  tool.package = stubPackageJson();

  // @ts-ignore
  tool.initialized = true;

  // Mock
  tool.on = jest.fn().mockReturnThis();
  tool.debug = mockDebugger();
  tool.createDebugger = mockDebugger;

  return tool;
}

export function mockDriver(
  name: string,
  tool: BeemoTool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver {
  const driver = new Driver();

  driver.name = name;
  driver.tool = tool || mockTool();

  driver.setMetadata({
    bin: name,
    configName: `${name}.json`,
    title: name,
    ...metadata,
  });

  driver.bootstrap();

  return driver;
}

export function applyContext<T extends Context>(context: T): T {
  context.args = parseArgs(['-a', '--foo', 'bar', 'baz']);
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.cwd = TEST_FIXTURE_ROOT;
  context.moduleRoot = TEST_FIXTURE_ROOT;
  context.workspaceRoot = TEST_FIXTURE_ROOT;
  context.workspaces = [];

  return context;
}

export function stubContext(): Context {
  return applyContext(new Context(stubArgs()));
}

export function stubConfigArgs(fields: Partial<ConfigArgs> = {}) {
  return stubArgs<ConfigArgs>({
    name: 'foo',
    names: [],
    ...fields,
  });
}

export function stubConfigContext(): ConfigContext {
  return applyContext(new ConfigContext(stubConfigArgs()));
}

export function stubDriverArgs(fields: Partial<DriverArgs> = {}) {
  return stubArgs<DriverArgs>({
    concurrency: 1,
    live: false,
    name: 'foo',
    priority: false,
    workspaces: '',
    ...fields,
  });
}

export function stubDriverContext(driver?: Driver): DriverContext {
  return applyContext(new DriverContext(stubDriverArgs(), driver || new Driver()));
}

export function stubScaffoldArgs(fields: Partial<ScaffoldArgs> = {}) {
  return stubArgs<ScaffoldArgs>({
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

export function stubScriptArgs(fields: Partial<ScriptArgs> = {}) {
  return stubArgs<ScriptArgs>({
    concurrency: 1,
    name: 'foo',
    priority: false,
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
