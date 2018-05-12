import path from 'path';
import parseArgs from 'yargs-parser';
import Driver from '../packages/core/src/Driver';

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

export function createContext(context = {}) {
  return {
    args: parseArgs(['-a', '--foo', 'bar', 'baz']),
    argv: ['-a', '--foo', 'bar', 'baz'],
    moduleRoot: __dirname,
    root: __dirname,
    ...context,
  };
}

export function createDriverContext(driver = null) {
  return createContext({
    configPaths: [],
    driverName: driver ? driver.name : '',
    drivers: [],
    primaryDriver: driver,
    workspaceRoot: '',
    workspaces: [],
  });
}

export function createScriptContext(script = null) {
  return createContext({
    script,
    scriptName: script ? script.name : '',
    scriptPath: '',
  });
}

export function prependRoot(part) {
  return path.join(__dirname, part);
}

export function getFixturePath(part) {
  return path.join(__dirname, 'fixtures', part);
}
