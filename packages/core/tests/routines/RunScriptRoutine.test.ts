/* eslint-disable jest/expect-expect */

import path from 'path';
import { getFixturePath } from '@boost/test-utils';
import ModuleLoader from '@boost/core/lib/ModuleLoader';
import RunScriptRoutine from '../../src/routines/RunScriptRoutine';
import { ExecuteScriptOptions } from '../../src/routines/script/ExecuteScriptRoutine';
import Script from '../../src/Script';
import { mockDebugger, mockTool, mockScript, stubScriptContext } from '../../src/testUtils';

jest.mock('@boost/core/lib/ModuleLoader', () =>
  jest.fn(() => ({
    importModule: jest.fn(tempName => {
      const { basename } = require.requireActual('path');
      const kebabCase = require.requireActual('lodash/kebabCase');
      const BaseScript = require.requireActual('../../src/Script').default;
      let name = tempName.includes('/') ? basename(tempName) : tempName;

      if (tempName.endsWith('Missing.js') || tempName === 'missing') {
        throw new Error(`Script "${name}" missing!`);
      }

      name = kebabCase(name.replace('.js', ''));

      class MockScript extends BaseScript {
        name = name;

        moduleName = `beemo-script-${name}`;

        blueprint() {
          return {};
        }

        execute() {
          return Promise.resolve(123);
        }
      }

      return new MockScript();
    }),
  })),
);

describe('RunScriptRoutine', () => {
  let routine: RunScriptRoutine;
  let script: Script;

  function expectPipedRoutines(mock: any, tests: ({ key: string } & ExecuteScriptOptions)[]) {
    expect(mock).toHaveBeenCalledTimes(tests.length);

    tests.forEach(test => {
      const { key = expect.anything(), ...options } = test;

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          key,
          options: expect.objectContaining({
            ...options,
          }),
        }),
      );
    });
  }

  beforeEach(() => {
    const tool = mockTool();

    script = mockScript('plugin-name', tool);

    routine = new RunScriptRoutine('script', 'Executing script');
    routine.context = stubScriptContext(script);
    routine.tool = tool;
    routine.debug = mockDebugger();

    routine.context.scriptName = 'plugin-name';

    // @ts-ignore
    ModuleLoader.mockClear();
  });

  describe('bootstrap()', () => {
    it('adds a routine for the script', () => {
      routine.pipe = jest.fn();
      routine.bootstrap();

      expectPipedRoutines(routine.pipe, [{ key: 'plugin-name' }]);
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

        expectPipedRoutines(routine.pipe, [
          { key: 'foo', packageRoot: path.join(fixturePath, './packages/foo') },
          { key: 'bar', packageRoot: path.join(fixturePath, './packages/bar') },
          { key: 'baz', packageRoot: path.join(fixturePath, './packages/baz') },
        ]);
      });
    });
  });

  describe('execute()', () => {
    beforeEach(() => {
      script.execute = () => Promise.resolve(123);
    });

    it('skips 2 tasks when script is returned from tool', async () => {
      const loadToolSpy = jest.spyOn(routine, 'loadScriptFromTool');
      const loadModuleSpy = jest.spyOn(routine, 'loadScriptFromConfigModule');
      const loadNodeSpy = jest.spyOn(routine, 'loadScriptFromNodeModules');
      const postSpy = jest.spyOn(routine, 'postLoad');

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
      const postSpy = jest.spyOn(routine, 'postLoad');

      routine.bootstrap();

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

  describe('postLoad()', () => {
    it('throws when previous errors exist and no script found', () => {
      routine.errors.push(new Error('One'), new Error('Two'), new Error('Three'));

      expect(() => {
        routine.postLoad(routine.context, null);
      }).toThrowError('Failed to load script from multiple sources:\n  - One\n  - Two\n  - Three');
    });

    it('adds plugin to tool', () => {
      const spy = jest.spyOn(routine.tool, 'addPlugin');

      routine.postLoad(routine.context, script);

      expect(spy).toHaveBeenCalledWith('script', script);
    });

    it('emits `onLoadPlugin` event with "script" scope', () => {
      const spy = jest.fn();

      routine.tool.onLoadPlugin.listen(spy, 'script');
      routine.postLoad(routine.context, script);

      expect(spy).toHaveBeenCalledWith(script);
    });
  });
});
