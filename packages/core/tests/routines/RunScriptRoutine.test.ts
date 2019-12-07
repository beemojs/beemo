/* eslint-disable jest/expect-expect */

import { Path } from '@boost/common';
import { getFixturePath, copyFixtureToNodeModule } from '@boost/test-utils';
import RunScriptRoutine from '../../src/routines/RunScriptRoutine';
import { ExecuteScriptOptions } from '../../src/routines/script/ExecuteScriptRoutine';
import Script from '../../src/Script';
import { mockDebugger, mockTool, mockScript, stubScriptContext } from '../../src/testUtils';

describe('RunScriptRoutine', () => {
  let fixtures: Function[] = [];
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

    script = mockScript('build', tool);

    routine = new RunScriptRoutine('script', 'Executing script');
    routine.context = stubScriptContext(script);
    routine.tool = tool;
    routine.debug = mockDebugger();

    routine.context.scriptName = 'build';

    fixtures = [];
  });

  afterEach(() => {
    fixtures.forEach(fixture => fixture());
  });

  describe('bootstrap()', () => {
    it('adds a routine for the script', () => {
      const spy = jest.spyOn(routine, 'pipe').mockImplementation();

      routine.bootstrap();

      expectPipedRoutines(spy, [{ key: 'build' }]);
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
      const loadModuleSpy = jest.spyOn(routine, 'loadScriptFromModule');
      const postSpy = jest.spyOn(routine, 'postLoad');

      routine.bootstrap();
      routine.tool.addPlugin('script', script);

      const response = await routine.execute(routine.context);

      expect(loadToolSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(loadModuleSpy).toHaveBeenCalledWith(routine.context, script, expect.anything());
      expect(postSpy).toHaveBeenCalledWith(routine.context, script, expect.anything());
      expect(response).toBe(456);
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
        new Error('From tool instance: Failed to find script "build". Have you installed it?'),
      ]);
    });
  });

  describe('loadScriptFromModule()', () => {
    it('returns script if passed as an argument', () => {
      const result = routine.loadScriptFromModule(routine.context, script);

      expect(result).toBe(script);
    });

    it('returns script from configuration module `scripts` folder', () => {
      routine.tool.config.module = 'from-config-module';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'build',
          moduleName: 'from-config-module/scripts/Build',
        }),
      );
    });

    it('returns script from configuration module `lib/scripts` folder', () => {
      routine.tool.config.module = 'from-config-lib-module';

      fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'build',
          moduleName: 'from-config-lib-module/lib/scripts/Build',
        }),
      );
    });

    it('returns script from node module index', () => {
      routine.tool.config.module = 'from-script-module';

      fixtures.push(copyFixtureToNodeModule('script-module', '@beemo/script-build'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'build',
          moduleName: '@beemo/script-build',
        }),
      );
    });

    it('returns script from node module lib index', () => {
      routine.tool.config.module = 'from-script-lib-module';

      // Change name to avoid colliding with previous test
      routine.context.scriptName = 'install';

      fixtures.push(copyFixtureToNodeModule('script-lib-module', 'beemo-script-install'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'install',
          moduleName: 'beemo-script-install',
        }),
      );
    });

    it('returns script from @local `scripts` folder', () => {
      routine.tool.config.module = '@local';
      routine.context.moduleRoot = new Path(getFixturePath('config-module'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'build',
          moduleName: 'scripts/Build.js',
        }),
      );
    });

    it('returns script from @local `lib/scripts` folder', () => {
      routine.tool.config.module = '@local';
      routine.context.moduleRoot = new Path(getFixturePath('config-lib-module'));

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'build',
          moduleName: 'lib/scripts/Build.js',
        }),
      );
    });

    it('sets an error if script not found in tool', () => {
      routine.context.scriptName = 'missing';
      routine.tool.config.module = 'beemo-test';

      const result = routine.loadScriptFromModule(routine.context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error(
          `From configuration or node module. Failed to resolve a path using the following lookups (in order):
  - beemo-test/lib/scripts/Missing (NODE_MODULE)
  - beemo-test/scripts/Missing (NODE_MODULE)
  - @beemo/script-missing (NODE_MODULE)
  - beemo-script-missing (NODE_MODULE)`,
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
