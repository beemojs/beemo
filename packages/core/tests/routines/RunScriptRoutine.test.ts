/* eslint-disable jest/expect-expect */

import { Path, Project } from '@boost/common';
import { getFixturePath, copyFixtureToNodeModule } from '@boost/test-utils';
import Script from '../../src/Script';
import Tool from '../../src/Tool';
import ScriptContext from '../../src/contexts/ScriptContext';
import RunScriptRoutine from '../../src/routines/RunScriptRoutine';
import { AnyRoutine } from '../../src/routines/RunInWorkspacesRoutine';
import { ExecuteScriptOptions } from '../../src/routines/script/ExecuteScriptRoutine';
import { mockDebugger, mockTool, mockScript, stubScriptContext } from '../../src/testing';

describe('RunScriptRoutine', () => {
  let fixtures: Function[] = [];
  let tool: Tool;
  let context: ScriptContext;
  let routine: RunScriptRoutine;
  let script: Script;

  function expectPipedRoutines(
    routines: AnyRoutine[],
    tests: ({ key: string } & Partial<ExecuteScriptOptions>)[],
  ) {
    expect(routines).toHaveLength(tests.length);

    tests.forEach((test, i) => {
      const { key, ...options } = test;

      expect(routines[i]).toEqual(
        expect.objectContaining({
          key,
          options: expect.objectContaining(options),
        }),
      );
    });
  }

  beforeEach(() => {
    tool = mockTool();
    script = mockScript('build', tool);

    context = stubScriptContext(script);
    context.scriptName = 'build';

    routine = new RunScriptRoutine('script', 'Executing script', { tool });
    // @ts-ignore
    routine.debug = mockDebugger();

    fixtures = [];
  });

  afterEach(() => {
    fixtures.forEach((fixture) => fixture());
  });

  describe('bootstrap()', () => {
    beforeEach(async () => {
      await tool.scriptRegistry.load(script);
    });

    it('adds a routine for the script', async () => {
      await routine.execute(context);

      expectPipedRoutines(routine.routines, [{ key: 'build' }]);
    });

    describe('workspaces', () => {
      const fixturePath = new Path(getFixturePath('workspaces-driver'));

      beforeEach(() => {
        context.args.options.workspaces = '*';
        context.workspaces = ['packages/*'];
        context.workspaceRoot = fixturePath;
        context.cwd = fixturePath;

        // @ts-ignore
        tool.project = new Project(fixturePath);
      });

      it('adds a routine for each workspace', async () => {
        await routine.execute(context);

        expectPipedRoutines(routine.routines, [
          { key: 'bar', packageRoot: fixturePath.append('./packages/bar').path() },
          { key: 'baz', packageRoot: fixturePath.append('./packages/baz').path() },
          { key: 'foo', packageRoot: fixturePath.append('./packages/foo').path() },
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

      await tool.scriptRegistry.load(script);

      const response = await routine.execute(context);

      expect(loadToolSpy).toHaveBeenCalledWith(context, undefined, expect.anything());
      expect(loadModuleSpy).toHaveBeenCalledWith(context, script, expect.anything());
      expect(postSpy).toHaveBeenCalledWith(context, script, expect.anything());
      expect(response).toBe(456);
    });
  });

  describe('loadScriptFromTool()', () => {
    it('returns script from tool', async () => {
      await tool.scriptRegistry.load(script);

      const result = routine.loadScriptFromTool(context);

      expect(result).toBe(script);
    });

    it('sets script to context', async () => {
      await tool.scriptRegistry.load(script);

      routine.loadScriptFromTool(context);

      expect(context.script).toBe(script);
    });

    it('sets an error if script not found in tool', () => {
      const result = routine.loadScriptFromTool(context);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error(
          'From tool instance: Failed to find script "build". Have you installed it? [PLG:PLUGIN_REQUIRED]',
        ),
      ]);
    });
  });

  describe('loadScriptFromModule()', () => {
    afterEach(async () => {
      try {
        await tool.scriptRegistry.unregister('build');
      } catch {
        // Ignore
      }
    });

    it('returns script if passed as an argument', async () => {
      const result = await routine.loadScriptFromModule(context, script);

      expect(result).toBe(script);
    });

    it('returns script from configuration module `scripts` folder', async () => {
      tool.config.module = 'from-config-module';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'config-script-build',
        }),
      );
    });

    it('returns script from configuration module `lib/scripts` folder', async () => {
      tool.config.module = 'from-config-lib-module';

      fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'config-script-lib-build',
        }),
      );
    });

    it('returns script from node module index', async () => {
      tool.config.module = '@beemo/script-build';

      fixtures.push(copyFixtureToNodeModule('script-module', '@beemo/script-build'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'script-build',
        }),
      );
    });

    it('returns script from node module lib/index', async () => {
      tool.config.module = 'beemo-script-install';

      // Change to not collide with test above
      context.scriptName = 'install';

      fixtures.push(copyFixtureToNodeModule('script-lib-module', 'beemo-script-install'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'script-lib-build',
        }),
      );
    });

    it('returns script from @local `scripts` folder', async () => {
      tool.config.module = '@local';
      context.configModuleRoot = new Path(getFixturePath('config-module'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: false,
          name: 'config-script-build',
        }),
      );
    });

    it('returns script from @local `lib/scripts` folder', async () => {
      tool.config.module = '@local';
      context.configModuleRoot = new Path(getFixturePath('config-lib-module'));

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toEqual(
        expect.objectContaining({
          lib: true,
          name: 'config-script-lib-build',
        }),
      );
    });

    it('sets an error if script not found in tool', async () => {
      context.scriptName = 'missing';
      tool.config.module = 'beemo-test';

      const result = await routine.loadScriptFromModule(context, null);

      expect(result).toBeNull();
      expect(routine.errors).toEqual([
        new Error(
          `From configuration or node module. Failed to resolve a path using the following lookups (in order):
  - beemo-test/lib/scripts/Missing (NODE_MODULE)
  - beemo-test/scripts/Missing (NODE_MODULE)
  - @beemo/script-missing (NODE_MODULE)
  - beemo-script-missing (NODE_MODULE)
 [CMN:PATH_RESOLVE_LOOKUPS]`,
        ),
      ]);
    });
  });

  describe('postLoad()', () => {
    it('throws when previous errors exist and no script found', () => {
      routine.errors.push(new Error('One'), new Error('Two'), new Error('Three'));

      expect(() => {
        routine.postLoad(context, null);
      }).toThrow('Failed to load script from multiple sources:\n  - One\n  - Two\n  - Three');
    });

    it('adds plugin to tool', () => {
      const spy = jest.spyOn(tool.scriptRegistry, 'load');

      routine.postLoad(context, script);

      expect(spy).toHaveBeenCalledWith(script);
    });
  });
});
