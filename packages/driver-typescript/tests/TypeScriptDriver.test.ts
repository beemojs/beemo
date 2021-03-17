import rimraf from 'rimraf';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/test';
import { getFixturePath } from '@boost/test-utils';
import TypeScriptDriver from '../src/TypeScriptDriver';

jest.mock('rimraf');

describe('TypeScriptDriver', () => {
  let driver: TypeScriptDriver;
  let context: DriverContext;

  beforeEach(() => {
    const tool = mockTool();
    // @ts-expect-error
    tool.project.root = new Path(getFixturePath('project-refs'));

    driver = new TypeScriptDriver();
    driver.startup(tool);
    driver.config = {
      compilerOptions: {},
    };

    context = stubDriverContext(driver);
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
      expandGlobs: true,
      strategy: 'native',
      buildFolder: 'lib',
      globalTypes: true,
      localTypes: false,
      srcFolder: 'src',
      testsFolder: 'tests',
      typesFolder: 'types',
      template: '',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual({
      bin: 'tsc',
      commandOptions: {
        clean: {
          default: false,
          description: 'Clean the target folder',
          type: 'boolean',
        },
      },
      configName: 'tsconfig.json',
      configOption: '',
      configStrategy: 'create',
      dependencies: [],
      description: 'Type check files with TypeScript',
      filterOptions: true,
      helpOption: '--help --all',
      title: 'TypeScript',
      useConfigOption: false,
      versionOption: '--version',
      watchOptions: ['-w', '--watch'],
      workspaceStrategy: 'copy',
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
});
