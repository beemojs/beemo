import path from 'path';
// @ts-ignore
import parseArgs from 'yargs-parser';
import { Tool } from '@boost/core';
import Driver from '../packages/core/src/Driver';
import Script from '../packages/core/src/Script';
import Context from '../packages/core/src/contexts/Context';
import DriverContext from '../packages/core/src/contexts/DriverContext';
import ScriptContext from '../packages/core/src/contexts/ScriptContext';
import { DriverMetadata } from '../packages/core/src/types';

export const EXEC_RESULT = {
  cmd: '',
  code: 0,
  failed: false,
  killed: false,
  signal: null,
  stderr: '',
  stdout: '',
  timedOut: false,
};

export function createTestDebugger(): any {
  const debug = jest.fn();

  // @ts-ignore
  debug.invariant = jest.fn();

  return debug;
}

export function createTestTool(): Tool {
  const tool = new Tool({
    appName: 'beemo',
    configBlueprint: {},
    configFolder: './configs',
    console: {},
    pluginAlias: 'driver',
    root: __dirname,
    scoped: true,
    workspaceRoot: __dirname,
  });

  tool.config = {
    config: {
      cleanup: false,
      parallel: true,
    },
    debug: false,
    extends: [],
    plugins: [],
    reporters: [],
    settings: {},
  };

  tool.package = {
    name: '',
  };

  tool.initialized = true;

  // Mock
  tool.on = jest.fn().mockReturnThis();
  tool.debug = createTestDebugger();
  tool.createDebugger = createTestDebugger;

  return tool;
}

export function createTestDriver(
  name: string,
  tool: Tool | null = null,
  metadata: Partial<DriverMetadata> = {},
): Driver<any> {
  const driver = new Driver();

  driver.name = name;
  driver.tool = tool || createTestTool();

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
  context.moduleRoot = __dirname;
  context.root = __dirname;

  return context;
}

export function createContext(): Context {
  return applyContext(new Context({ _: [], $0: '' }));
}

export function createDriverContext(driver: Driver<any> | null = null): DriverContext {
  return applyContext(new DriverContext({ _: [], $0: '' }, driver || new Driver()));
}

export function createScriptContext(script: Script | null = null): ScriptContext {
  const context = applyContext(new ScriptContext({ _: [], $0: '' }, 'script'));

  if (script) {
    context.setScript(script, './script.js');
  }

  return context;
}

export function prependRoot(part: string): string {
  return path.join(__dirname, part);
}

export function getRoot(): string {
  return __dirname;
}

export function getFixturePath(part: string): string {
  return path.join(__dirname, 'fixtures', part);
}
