import path from 'path';
import ModuleLoader from '@boost/core/lib/ModuleLoader';
import ExecuteScriptRoutine from '../src/ExecuteScriptRoutine';
import RunScriptRoutine from '../src/execute/RunScriptRoutine';
import Script from '../src/Script';
import {
  createScriptContext,
  createTestDebugger,
  createTestTool,
  getRoot,
  getFixturePath,
} from '../../../tests/helpers';

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
    script.name = 'foo-bar';

    routine = new ExecuteScriptRoutine('script', 'Executing script');
    routine.context = createScriptContext();
    routine.tool = createTestTool();
    routine.debug = createTestDebugger();

    routine.context.scriptName = 'FooBar';
    routine.context.eventName = 'foo-bar';
    routine.context.binName = 'foo-bar';

    // TEMP
    routine.tool.registerPlugin('script', Script);

    // @ts-ignore
    ModuleLoader.mockClear();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the script', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expect(routine.pipe).toHaveBeenCalledWith(createTestRunScript('FooBar'));
    });

    describe('workspaces', () => {
      const fixturePath = getFixturePath('workspaces-driver');

      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.workspaceRoot = fixturePath;
        routine.context.root = fixturePath;
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
        expect.objectContaining({ name: 'FooBar' }),
        expect.anything(),
      );
      expect(postSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({ name: 'FooBar' }),
        expect.anything(),
      );
      expect(response).toBe(123);
    });

    it('skips no tasks when script is returned from node module', async () => {
      const loadToolSpy = jest.spyOn(routine, 'loadScriptFromTool');
      const loadModuleSpy = jest.spyOn(routine, 'loadScriptFromConfigModule');
      const loadNodeSpy = jest.spyOn(routine, 'loadScriptFromNodeModules');
      const postSpy = jest.spyOn(routine, 'handlePostLoad');

      routine.bootstrap();
      routine.tool.addPlugin = jest.fn();
      routine.context.binName = 'npm-name';
      routine.context.scriptName = 'Missing';

      const response = await routine.execute(routine.context);

      expect(loadToolSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(loadModuleSpy).toHaveBeenCalledWith(routine.context, null, expect.anything());
      expect(loadNodeSpy).toHaveBeenCalledWith(routine.context, null, expect.anything());
      expect(postSpy).toHaveBeenCalledWith(
        routine.context,
        expect.objectContaining({ name: 'npm-name' }),
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
        new Error('From tool instance: Failed to find script "foo-bar". Have you installed it?'),
      ]);
    });
  });

  describe('loadScriptFromConfigModule()', () => {
    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from configuration module scripts folder', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'FooBar',
          moduleName: 'beemo-script-foo-bar',
        }),
      );
    });

    it('sets script to context', () => {
      routine.loadScriptFromConfigModule(routine.context, null);

      expect(routine.context.script).toEqual(
        expect.objectContaining({
          name: 'FooBar',
          moduleName: 'beemo-script-foo-bar',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.scriptName = 'Missing';

      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error('From configuration module: Script "Missing.js" missing!'),
      ]);
    });
  });

  describe('loadScriptFromNodeModules()', () => {
    beforeEach(() => {
      routine.context.binName = 'npm-name';
    });

    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromNodeModules(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from NPM module', () => {
      const result = routine.loadScriptFromNodeModules(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'npm-name',
          moduleName: 'beemo-script-npm-name',
        }),
      );
    });

    it('sets script to context', () => {
      routine.loadScriptFromNodeModules(routine.context, null);

      expect(routine.context.script).toEqual(
        expect.objectContaining({
          name: 'npm-name',
          moduleName: 'beemo-script-npm-name',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.binName = 'missing';

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

      expect(spy).toHaveBeenCalledWith('foo-bar.load-script', [routine.context, script]);
    });
  });
});
