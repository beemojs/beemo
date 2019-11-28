/* eslint-disable jest/expect-expect */

import { Path } from '@boost/common';
import { getFixturePath } from '@boost/test-utils';
import RunScriptRoutine from '../../src/routines/RunScriptRoutine';
import { ExecuteScriptOptions } from '../../src/routines/script/ExecuteScriptRoutine';
import Script from '../../src/Script';
import { mockDebugger, mockTool, mockScript, stubScriptContext } from '../../src/testUtils';

jest.mock(
  'beemo-script-from-node-module',
  () => {
    const MockScript = require.requireActual('../../src/Script').default;

    return class FromNodeModuleScript extends MockScript {
      blueprint() {
        return {};
      }

      execute() {
        return 123;
      }
    };
  },
  { virtual: true },
);

jest.mock(
  'from-config-module/scripts/PluginName.js',
  () => {
    const MockScript = require.requireActual('../../src/Script').default;

    return class FromConfigModuleScript extends MockScript {
      blueprint() {
        return {};
      }

      execute() {
        return 123;
      }
    };
  },
  { virtual: true },
);

jest.mock(
  'from-config-module-lib/scripts/PluginName.js',
  () => {
    const MockScript = require.requireActual('../../src/Script').default;

    return class FromConfigModuleLibScript extends MockScript {
      blueprint() {
        return {};
      }

      execute() {
        return 123;
      }
    };
  },
  { virtual: true },
);

describe('RunScriptRoutine', () => {
  let routine: RunScriptRoutine;
  let script: Script;

  function expectPipedRoutines(
    mock: jest.SpyInstance,
    tests: ({ key: string } & ExecuteScriptOptions)[],
  ) {
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
  });

  describe('bootstrap()', () => {
    it('adds a routine for the script', () => {
      const spy = jest.spyOn(routine, 'pipe').mockImplementation();

      routine.bootstrap();

      expectPipedRoutines(spy, [{ key: 'plugin-name' }]);
    });

    describe('workspaces', () => {
      const fixturePath = new Path(getFixturePath('workspaces-driver'));

      beforeEach(() => {
        routine.context.args.workspaces = '*';
        routine.context.workspaces = ['packages/*'];
        routine.context.workspaceRoot = fixturePath;
        routine.context.cwd = fixturePath;
      });

      it('adds a routine for each workspace', () => {
        const spy = jest.spyOn(routine, 'pipe').mockImplementation();

        routine.bootstrap();

        expectPipedRoutines(spy, [
          { key: 'foo', packageRoot: fixturePath.append('./packages/foo').path() },
          { key: 'bar', packageRoot: fixturePath.append('./packages/bar').path() },
          { key: 'baz', packageRoot: fixturePath.append('./packages/baz').path() },
        ]);
      });
    });
  });

  describe('execute()', () => {
    it('skips 2 tasks when script is returned from tool', async () => {
      jest.spyOn(script, 'execute').mockImplementation(() => Promise.resolve(456));

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
      expect(response).toBe(456);
    });

    it('skips 1 task when script is returned from config module', async () => {
      routine.tool.config.module = 'from-config-module';

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
      routine.tool.config.module = 'from-config-module';
    });

    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from configuration module `scripts` folder', () => {
      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'plugin-name',
          moduleName: 'from-config-module',
        }),
      );
    });

    it('returns script from configuration module `lib/scripts` folder', () => {
      routine.tool.config.module = 'from-config-module-lib';

      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'plugin-name',
          moduleName: 'from-config-module-lib',
        }),
      );
    });

    it('sets script to context', () => {
      routine.loadScriptFromConfigModule(routine.context, null);

      expect(routine.context.script).toEqual(
        expect.objectContaining({
          name: 'plugin-name',
          moduleName: 'from-config-module',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.scriptName = 'missing';

      const result = routine.loadScriptFromConfigModule(routine.context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error(
          'From configuration module: Missing script. Attempted import in order: from-config-module/lib/scripts/Missing.js',
        ),
        new Error(
          'From configuration module: Missing script. Attempted import in order: from-config-module/scripts/Missing.js',
        ),
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
      expect(routine.errors).toEqual([
        new Error(
          'From node modules: Missing script. Attempted import in order: @beemo/script-missing, beemo-script-missing',
        ),
      ]);
    });
  });

  describe('postLoad()', () => {
    it('throws when previous errors exist and no script found', () => {
      routine.errors.push(new Error('One'), new Error('Two'), new Error('Three'));

      expect(() => {
        routine.postLoad(routine.context, null);
      }).toThrow('Failed to load script from multiple sources:\n  - One\n  - Two\n  - Three');
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
