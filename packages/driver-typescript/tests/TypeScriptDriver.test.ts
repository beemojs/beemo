import fs from 'fs';
import rimraf from 'rimraf';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/test';
import { getFixturePath } from '@boost/test-utils';
import TypeScriptDriver from '../src/TypeScriptDriver';

jest.mock('rimraf');

const PROJECT_REFS_FIXTURE_PATH = new Path(getFixturePath('project-refs'));
const PROJECT_REFS_ROOT_CONFIG = PROJECT_REFS_FIXTURE_PATH.append('tsconfig.json');
const PROJECT_REFS_OPTIONS_CONFIG = PROJECT_REFS_FIXTURE_PATH.append('tsconfig.options.json');

describe('TypeScriptDriver', () => {
  let driver: TypeScriptDriver;
  let context: DriverContext;
  let writeSpy: jest.SpyInstance;
  let writeSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    driver = new TypeScriptDriver();
    driver.tool = mockTool();
    // @ts-expect-error
    driver.tool.project.root = PROJECT_REFS_FIXTURE_PATH;
    driver.bootstrap();
    driver.config = {
      compilerOptions: {},
    };

    context = stubDriverContext(driver);

    writeSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
    writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation((fp, config, cb) => {
      (cb as Function)(null);
    });
  });

  afterEach(() => {
    writeSpy.mockRestore();
    writeSyncSpy.mockRestore();
  });

  it('sets options from constructor', () => {
    driver = new TypeScriptDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
      localTypes: false,
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      declarationOnly: false,
      dependencies: ['babel'],
      env: { DEV: 'true' },
      strategy: 'native',
      buildFolder: 'lib',
      globalTypes: true,
      localTypes: false,
      srcFolder: 'src',
      testsFolder: 'tests',
      typesFolder: 'types',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'tsc',
        configName: 'tsconfig.json',
        configOption: '',
        dependencies: [],
        description: 'Type check files with TypeScript',
        filterOptions: true,
        helpOption: '--help --all',
        title: 'TypeScript',
        useConfigOption: false,
        workspaceStrategy: 'copy',
      }),
    );
  });

  describe('createProjectRefConfigsInWorkspaces()', () => {
    it('creates a source and optional test config in each package root', () => {
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/bar/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*', '../../types/**/*'],
          references: [{ path: '../foo' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*', '../../types/**/*'],
          references: [{ path: '../foo' }, { path: '../bar' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tests/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            composite: false,
            emitDeclarationOnly: false,
            noEmit: true,
            rootDir: '.',
          },
          extends: '../../../tsconfig.options.json',
          include: ['**/*', '../types/**/*', '../../../types/**/*'],
          references: [{ path: '..' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/foo/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'tests', 'some/path'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*', '../../types/**/*'],
          references: [],
        }),
        expect.anything(),
      );
    });

    it('supports emitting `declarationOnly', () => {
      driver.configure({
        declarationOnly: true,
      });
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/bar/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
            emitDeclarationOnly: true,
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*', '../../types/**/*'],
          references: [{ path: '../foo' }],
        }),
        expect.anything(),
      );
    });

    it('supports custom `srcFolder` and `buildFolder`', () => {
      driver.configure({
        buildFolder: 'build',
        srcFolder: 'source',
      });
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/qux/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'build',
            outDir: 'build',
            rootDir: 'source',
          },
          exclude: ['build', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['source/**/*', 'types/**/*', '../../types/**/*'],
          references: [],
        }),
        expect.anything(),
      );
    });

    it('supports custom `typesFolder` and `testsFolder`', () => {
      driver.configure({
        typesFolder: 'typings',
        testsFolder: 'custom-tests',
      });
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/foo/custom-tests/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            composite: false,
            emitDeclarationOnly: false,
            noEmit: true,
            rootDir: '.',
          },
          extends: '../../../tsconfig.options.json',
          include: ['**/*', '../typings/**/*', '../../../typings/**/*'],
          references: [{ path: '..' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/foo/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'custom-tests', 'some/path'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'typings/**/*', '../../typings/**/*'],
          references: [],
        }),
        expect.anything(),
      );
    });

    it('excludes local types when `localTypes` is false', () => {
      driver.configure({ localTypes: false });
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', '../../types/**/*'],
          references: [{ path: '../foo' }, { path: '../bar' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tests/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            composite: false,
            emitDeclarationOnly: false,
            noEmit: true,
            rootDir: '.',
          },
          extends: '../../../tsconfig.options.json',
          include: ['**/*', '../../../types/**/*'],
          references: [{ path: '..' }],
        }),
        expect.anything(),
      );
    });

    it('excludes global types when `globalTypes` is false', () => {
      driver.configure({ globalTypes: false });
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*'],
          references: [{ path: '../foo' }, { path: '../bar' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tests/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            composite: false,
            emitDeclarationOnly: false,
            noEmit: true,
            rootDir: '.',
          },
          extends: '../../../tsconfig.options.json',
          include: ['**/*', '../types/**/*'],
          references: [{ path: '..' }],
        }),
        expect.anything(),
      );
    });

    it('emits `onCreateProjectConfigFile` event', () => {
      const spy = jest.fn((ctx, filePath, config, isTests) => {
        if (isTests) {
          config.compilerOptions.testsOnly = true;
        } else {
          config.compilerOptions.srcOnly = true;
        }
      });

      driver.onCreateProjectConfigFile.listen(spy);
      driver.createProjectRefConfigsInWorkspaces(context, PROJECT_REFS_FIXTURE_PATH);

      expect(spy).toHaveBeenCalledTimes(4);

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tests/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            composite: false,
            emitDeclarationOnly: false,
            noEmit: true,
            rootDir: '.',
            // @ts-expect-error Testing purposes
            testsOnly: true,
          },
          extends: '../../../tsconfig.options.json',
          include: ['**/*', '../types/**/*', '../../../types/**/*'],
          references: [{ path: '..' }],
        }),
        expect.anything(),
      );

      expect(writeSpy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH.append('packages/baz/tsconfig.json').path(),
        driver.formatConfig({
          compilerOptions: {
            declarationDir: 'lib',
            outDir: 'lib',
            rootDir: 'src',
            // @ts-expect-error Testing purposes
            srcOnly: true,
          },
          exclude: ['lib', 'tests'],
          extends: '../../tsconfig.options.json',
          include: ['src/**/*', 'types/**/*', '../../types/**/*'],
          references: [{ path: '../foo' }, { path: '../bar' }],
        }),
        expect.anything(),
      );
    });
  });

  describe('prepareProjectRefsRootConfigs()', () => {
    it('removes `compilerOptions` from config object', () => {
      const config = {
        compileOnSave: true,
        compilerOptions: {
          noEmit: true,
        },
      };

      driver.prepareProjectRefsRootConfigs(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        config,
      );

      expect(config.compilerOptions).toBeUndefined();
    });

    it('removes `include` and `exclude` from config object', () => {
      const config = {
        include: ['src/**/*'],
        exclude: ['tests/**/*'],
      };

      driver.prepareProjectRefsRootConfigs(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        config,
      );

      expect(config.include).toBeUndefined();
      expect(config.exclude).toBeUndefined();
    });

    it('writes `compilerOptions` to a new file while adding new fields', () => {
      const config = {
        compileOnSave: true,
        compilerOptions: {
          noEmit: true,
        },
      };

      driver.prepareProjectRefsRootConfigs(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        config,
      );

      expect(writeSyncSpy).toHaveBeenCalledWith(
        PROJECT_REFS_OPTIONS_CONFIG.path(),
        driver.formatConfig({
          compilerOptions: {
            noEmit: true,
            composite: true,
            declaration: true,
            declarationMap: true,
            outDir: undefined,
            outFile: undefined,
          },
        }),
      );
    });

    it('sets `references`, `files`, and `extends` on base config object', () => {
      const config = {
        compilerOptions: {
          noEmit: true,
        },
      };

      driver.prepareProjectRefsRootConfigs(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        config,
      );

      expect(config).toEqual({
        extends: './tsconfig.options.json',
        files: [],
        references: [
          { path: 'packages/bar' },
          { path: 'packages/baz' },
          { path: 'packages/baz/tests' },
          { path: 'packages/foo' },
        ],
      });
    });

    it('includes `testsFolder` when using a custom value', () => {
      const config = {};

      driver.configure({ testsFolder: 'custom-tests' });

      driver.prepareProjectRefsRootConfigs(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        config,
      );

      expect(config).toEqual({
        extends: './tsconfig.options.json',
        files: [],
        references: [
          { path: 'packages/bar' },
          { path: 'packages/baz' },
          { path: 'packages/foo' },
          { path: 'packages/foo/custom-tests' },
        ],
      });
    });
  });

  describe('handleCleanTarget()', () => {
    it('doesnt run if no config', () => {
      driver.config = {};
      // @ts-expect-error Allow private access
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no --clean param', () => {
      driver.config.compilerOptions = { outDir: './lib' };
      // @ts-expect-error Allow private access
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      context.args.unknown.clean = '';
      driver.config.compilerOptions = {};
      // @ts-expect-error Allow private access
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      context.args.unknown.clean = '';
      driver.config.compilerOptions = { outDir: './lib' };
      // @ts-expect-error Allow private access
      driver.handleCleanTarget(context);

      expect(rimraf.sync).toHaveBeenCalledWith(Path.resolve('./lib').path());
    });
  });

  describe('handlePrepareConfigs()', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(driver, 'prepareProjectRefsRootConfigs');
    });

    it('doesnt prepare configs if --reference-workspaces is not passed', () => {
      // @ts-expect-error Allow private access
      driver.handlePrepareConfigs(context, PROJECT_REFS_ROOT_CONFIG, {});

      expect(spy).not.toHaveBeenCalled();
    });

    it('prepares configs if --reference-workspaces is passed', () => {
      context.args.unknown.referenceWorkspaces = '';
      context.workspaceRoot = PROJECT_REFS_FIXTURE_PATH;

      // @ts-expect-error Allow private access
      driver.handlePrepareConfigs(context, PROJECT_REFS_ROOT_CONFIG, {});

      expect(spy).toHaveBeenCalledWith(
        PROJECT_REFS_FIXTURE_PATH,
        PROJECT_REFS_ROOT_CONFIG,
        expect.objectContaining({ extends: './tsconfig.options.json' }),
      );

      expect(context.configPaths).toEqual([
        { driver: 'typescript', path: PROJECT_REFS_OPTIONS_CONFIG },
      ]);
    });
  });

  describe('handleProjectReferences()', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(driver, 'createProjectRefConfigsInWorkspaces');
    });

    it('doesnt create configs if --reference-workspaces is not passed', () => {
      // @ts-expect-error Allow private access
      driver.handleProjectReferences(context);

      expect(spy).not.toHaveBeenCalled();
    });

    it('errors if --reference-workspaces and --workspaces are passed', () => {
      context.args.unknown.build = '';
      context.args.unknown.referenceWorkspaces = '';
      context.args.options.workspaces = '*';

      expect(() => {
        // @ts-expect-error Allow private access
        driver.handleProjectReferences(context);
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if --build isnt passed with --reference-workspaces', () => {
      context.args.unknown.referenceWorkspaces = '';

      expect(() => {
        // @ts-expect-error Allow private access
        driver.handleProjectReferences(context);
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates configs if --reference-workspaces is passed', () => {
      context.args.unknown.build = '';
      context.args.unknown.referenceWorkspaces = '';
      context.workspaceRoot = PROJECT_REFS_FIXTURE_PATH;

      // @ts-expect-error Allow private access
      driver.handleProjectReferences(context);

      expect(spy).toHaveBeenCalledWith(context, PROJECT_REFS_FIXTURE_PATH);
    });

    it('works with -b flag', () => {
      context.args.unknown.b = '';
      context.args.unknown.referenceWorkspaces = '';
      context.workspaceRoot = PROJECT_REFS_FIXTURE_PATH;

      // @ts-expect-error Allow private access
      driver.handleProjectReferences(context);

      expect(spy).toHaveBeenCalledWith(context, PROJECT_REFS_FIXTURE_PATH);
    });
  });
});
