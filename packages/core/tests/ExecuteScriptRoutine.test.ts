import path from 'path';
import { getFixturePath } from '@boost/test-utils';
import ModuleLoader from '@boost/core/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import RunScriptRoutine from '../src/execute/RunScriptRoutine';
import Script from '../src/Script';
import { mockDebugger, mockTool, stubScriptContext } from '../src/testUtils';
import { getRoot } from '../../../tests/helpers';

jest.mock('@boost/core/lib/ModuleLoader', () =>
  jest.fn(() => ({
    importModule: jest.fn(tempName => {
      const { basename } = require.requireActual('path');
      const kebabCase = require.requireActual('lodash/kebabCase');
      let name = tempName.includes('/') ? basename(tempName) : tempName;

      if (tempName.endsWith('Missing.js') || tempName === 'missing') {
        throw new Error(`Script "${name}" missing!`);
      }

      name = kebabCase(name.replace('.js', ''));

      return {
        name,
        moduleName: `beemo-script-${name}`,
        args: jest.fn(() => ({})),
        boostrap: jest.fn(),
        execute: () => Promise.resolve(123),
      };
    }),
  })),
);

describe('ExecuteScriptRoutine', () => {
  let routine: ExecuteScriptRoutine;
  let script: Script;

  class TestScript extends Script {
    execute() {
      return Promise.resolve(123);
    }
  }

  function createTestRunScript(title: string, options: any = {}) {
    const run = new RunScriptRoutine(title, '-a --foo bar baz', {
      packageRoot: getRoot(),
      ...options,
    });

    run.action = expect.anything();

    return run;
  }

  beforeEach(() => {
    script = new TestScript();
    script.name = 'plugin-name';

    routine = new ExecuteScriptRoutine('script', 'Executing script');
    routine.context = stubScriptContext();
    routine.tool = mockTool();
    routine.debug = mockDebugger();

    routine.context.scriptName = 'plugin-name';
    routine.context.eventName = 'plugin-name';

    // TEMP
    routine.tool.registerPlugin('script', Script);

    // @ts-ignore
    ModuleLoader.mockClear();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the script', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(createTestRunScript('plugin-name'));
    });

    describe('workspaces', () => {
      const fixturePath = getFixturePath('workspaces-driver');

      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.workspaceRoot = fixturePath;
        routine.context.cwd = fixturePath;
      });

      it('adds a routine for each workspace', () => {
        routine.pipe = jest.fn();
        routine.bootstrap();

        expect(routine.pipe).toHaveBeenCalledTimes(3);
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunScript('foo', {
            packageRoot: path.join(fixturePath, './packages/foo'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunScript('bar', {
            packageRoot: path.join(fixturePath, './packages/bar'),
          }),
        );
        expect(routine.pipe).toHaveBeenCalledWith(
          createTestRunScript('baz', {
            packageRoot: path.join(fixturePath, './packages/baz'),
          }),
        );
      });
    });
  });

  describe('execute()', () => {
    it('skips 2 tasks when script is returned from tool', async () => {
      const loadToolSpy = jest.spyOn(routine, 'loadScriptFromTool');
      const loadModuleSpy = jest.spyOn(routine, 'loadScriptFromConfigModule');
      const loadNodeSpy = jest.spyOn(routine, 'loadScriptFromNodeModules');
      const postSpy = jest.spyOn(routine, 'handlePostLoad');

      routine.bootstrap();
      routine.tool.addPlugin('script', script);

      const response = await routine.execute(routine.context);

      expect(loadToolSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(loadModuleSpy).toHaveBeenCalledWith(routine.context, script, expect.anything());
      expect(loadNodeSpy).toHaveBeenCalledWith(routine.context, script, expect.anything());
      expect(postSpy).toHaveBeenCalledWith(routine.context, script, expect.anything());
      expect(response).toBe(123);
    });

    it('skips 1 task when script is returned from config module', async () => {
      const loadToolSpy = jest.spyOn(routine, 'loadScriptFromTool');
      const loadModuleSpy = jest.spyOn(routine, 'loadScriptFromConfigModule');
      const loadNodeSpy = jest.spyOn(routine, 'loadScriptFromNodeModules');
      const postSpy = jest.spyOn(routine, 'handlePostLoad');

      routine.bootstrap();
      routine.tool.addPlugin = jest.fn();

      const response = await routine.execute(routine.context);

      expect(loadToolSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(loadModuleSpy).toHaveBeenCalledWith(routine.context, null, expect.anything());
      expect(loadNodeSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({ name: 'plugin-name' }),
        expect.anything(),
      );
      expect(postSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({ name: 'plugin-name' }),
        expect.anything(),
      );
      expect(response).toBe(123);
    });
  });

  describe('loadScriptFromTool()', () => {
    it('returns script from tool', () => {
      routine.tool.addPlugin('script', script);

      const result = routine.loadScriptFromTool(routine.context);

      expect(result).toBe(script);
    });

    it('sets script to context', () => {
      routine.tool.addPlugin('script', script);
      routine.loadScriptFromTool(routine.context);

      expect(routine.context.script).toBe(script);
    });

    it('sets an error if script not found in tool', () => {
      const result = routine.loadScriptFromTool(routine.context);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error(
          'From tool instance: Failed to find script "plugin-name". Have you installed it?',
        ),
      ]);
    });
  });

  describe('loadScriptFromConfigModule()', () => {
    beforeEach(() => {
      script.name = 'from-config-module';
    });

    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from configuration module scripts folder', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'plugin-name',
          moduleName: 'beemo-script-plugin-name',
        }),
      );
    });

    it('sets script to context', () => {
      routine.loadScriptFromConfigModule(routine.context, null);

      expect(routine.context.script).toEqual(
        expect.objectContaining({
          name: 'plugin-name',
          moduleName: 'beemo-script-plugin-name',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.scriptName = 'missing';

      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error('From configuration module: Script "Missing.js" missing!'),
      ]);
    });
  });

  describe('loadScriptFromNodeModules()', () => {
    beforeEach(() => {
      routine.context.scriptName = 'from-node-module';
    });

    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromNodeModules(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from NPM module', () => {
      const result = routine.loadScriptFromNodeModules(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'from-node-module',
          moduleName: 'beemo-script-from-node-module',
        }),
      );
    });

    it('sets script to context', () => {
      routine.loadScriptFromNodeModules(routine.context, null);

      expect(routine.context.script).toEqual(
        expect.objectContaining({
          name: 'from-node-module',
          moduleName: 'beemo-script-from-node-module',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.scriptName = 'missing';

      const result = routine.loadScriptFromNodeModules(routine.context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([new Error('From node modules: Script "missing" missing!')]);
    });
  });

  describe('handlePostLoad()', () => {
    beforeEach(() => {
      routine.tool.addPlugin = jest.fn();
    });

    it('throws when previous errors exist and no script found', () => {
      routine.errors.push(new Error('One'), new Error('Two'), new Error('Three'));

      expect(() => {
        routine.handlePostLoad(routine.context, null);
      }).toThrowError('Failed to load script from multiple sources:\n  - One\n  - Two\n  - Three');
    });

    it('adds plugin to tool', () => {
      routine.handlePostLoad(routine.context, script);

      expect(routine.tool.addPlugin).toHaveBeenCalledWith('script', script);
    });

    it('triggers `load-script` event', () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      routine.handlePostLoad(routine.context, script);

      expect(spy).toHaveBeenCalledWith('plugin-name.load-script', [routine.context, script]);
    });
  });
});
