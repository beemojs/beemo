import path from 'path';
import parseArgs from 'yargs-parser';
import { Tool } from 'boost';
import Console from 'boost/lib/Console';
import Driver from '../packages/core/src/Driver';
import Script from '../packages/core/src/Script';
import Context from '../packages/core/src/contexts/Context';
import DriverContext from '../packages/core/src/contexts/DriverContext';
import ScriptContext from '../packages/core/src/contexts/ScriptContext';
import { DriverMetadata } from '../packages/core/src/types';

jest.mock('boost/lib/Console');

export function setupMockTool(tool: Tool<any>): Tool<any> {
  tool.options = {
    appName: 'Beemo',
    configBlueprint: {},
    configFolder: './configs',
    console: {},
    pluginAlias: 'driver',
    root: __dirname,
    scoped: true,
    workspaceRoot: __dirname,
  };

  tool.config = {
    config: {
      cleanup: false,
      parallel: true,
    },
    debug: false,
    extends: [],
    plugins: [],
    reporters: [],
  };

  tool.package = {
    name: '',
  };

  tool.console = new Console();

  // @ts-ignore
  tool.createDebugger = () => jest.fn();

  return tool;
}

export function createDriver(
  name: string,
  tool?: Tool<any>,
  metadata: Partial<DriverMetadata> = {},
): Driver<any> {
  const driver = new Driver();

  driver.name = name;

  if (tool) {
    driver.tool = setupMockTool(tool);
  }

  driver.setMetadata({
    bin: name,
    configName: `${name}.json`,
    title: name,
    ...metadata,
  });

  driver.bootstrap();

  return driver;
}

export function createTestDebugger(): any {
  const debug = jest.fn();

  // @ts-ignore
  debug.invariant = jest.fn();

  return debug;
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
