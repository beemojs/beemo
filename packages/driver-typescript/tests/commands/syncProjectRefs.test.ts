import fs from 'fs';
import { Path, Tool } from '@beemo/core';
import { mockTool } from '@beemo/core/test';
import { getFixturePath } from '@boost/test-utils';
import syncProjectRefs from '../../src/commands/syncProjectRefs';
import TypeScriptDriver from '../../src/TypeScriptDriver';

const PROJECT_REFS_FIXTURE_PATH = new Path(getFixturePath('project-refs'));

function json(content: unknown) {
  return JSON.stringify(content, null, 2);
}

describe('syncProjectRefs()', () => {
  let tool: Tool;
  let driver: TypeScriptDriver;
  let writeSpy: jest.SpyInstance;

  beforeEach(async () => {
    tool = mockTool();
    // @ts-expect-error
    tool.project.root = PROJECT_REFS_FIXTURE_PATH;

    driver = new TypeScriptDriver();

    await tool.driverRegistry.register('typescript', driver, tool);

    writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation((fp, config, cb) => {
      (cb as Function)(null);
    });
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  describe('addProjectRefsToRootConfig()', () => {
    it('removes `compilerOptions` from tsconfig.json', async () => {
      await syncProjectRefs(tool);

      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.not.stringMatching(/compilerOptions/u),
        expect.any(Function),
      );
    });

    it('removes `include` and `exclude` from tsconfig.json', async () => {
      await syncProjectRefs(tool);

      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.not.stringMatching(/include|exclude/u),
        expect.any(Function),
      );
    });

    it('writes `compilerOptions` to a new file while adding new fields', async () => {
      await syncProjectRefs(tool);

      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.options.json'),
        json({
          compilerOptions: {
            module: 'esnext',
            composite: true,
            declaration: true,
            declarationMap: true,
            outDir: undefined,
            outFile: undefined,
          },
        }),
        expect.any(Function),
      );
    });

    it('sets `references`, `files`, and `extends` on base config object', async () => {
      await syncProjectRefs(tool);

      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        json({
          extends: './tsconfig.options.json',
          files: [],
          references: [
            { path: 'packages/bar' },
            { path: 'packages/baz' },
            { path: 'packages/baz/tests' },
            { path: 'packages/foo' },
          ],
        }),
        expect.any(Function),
      );
    });

    it('includes `testsFolder` when using a custom value', async () => {
      driver.configure({ testsFolder: 'custom-tests' });

      await syncProjectRefs(tool);

      expect(writeSpy).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        json({
          extends: './tsconfig.options.json',
          files: [],
          references: [
            { path: 'packages/bar' },
            { path: 'packages/baz' },
            { path: 'packages/foo' },
            { path: 'packages/foo/custom-tests' },
          ],
        }),
        expect.any(Function),
      );
    });
  });
});
