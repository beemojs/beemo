import path from 'path';
import parseArgs from 'yargs-parser';
import Driver from '../packages/core/src/Driver';
import Context from '../packages/core/src/contexts/Context';
import DriverContext from '../packages/core/src/contexts/DriverContext';
import ScriptContext from '../packages/core/src/contexts/ScriptContext';

export function setupMockTool(tool) {
  tool.options = {
    appName: 'Beemo',
    pluginAlias: 'driver',
    root: __dirname,
    scoped: true,
  };

  tool.config = {
    config: {
      cleanup: false,
      parallel: true,
    },
    debug: false,
  };

  tool.package = {};

  tool.console = {
    emit: jest.fn(),
  };

  tool.createDebugger = () => jest.fn();

  return tool;
}

export function createDriver(name, tool, metadata = {}) {
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

export function applyContext(context) {
  context.args = parseArgs(['-a', '--foo', 'bar', 'baz']);
  context.argv = ['-a', '--foo', 'bar', 'baz'];
  context.moduleRoot = __dirname;
  context.root = __dirname;

  return context;
}

export function createContext() {
  return applyContext(new Context({}));
}

export function createDriverContext(driver = null) {
  return applyContext(new DriverContext({}, driver || {}));
}

export function createScriptContext(script = null) {
  const context = applyContext(new ScriptContext({}));

  if (script) {
    context.setScript(script);
  }

  return context;
}

export function prependRoot(part) {
  return path.join(__dirname, part);
}

export function getRoot() {
  return __dirname;
}

export function getFixturePath(part) {
  return path.join(__dirname, 'fixtures', part);
}
