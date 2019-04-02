import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import ts from 'typescript';
import { Driver, DriverArgs, DriverContext, Predicates } from '@beemo/core';
import { TypeScriptArgs, TypeScriptConfig, TypeScriptOptions } from './types';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig, TypeScriptOptions> {
  blueprint(preds: Predicates) /* infer */ {
    const { bool, string } = preds;

    return {
      ...super.blueprint(preds),
      buildFolder: string('lib'),
      globalTypes: bool(),
      srcFolder: string('src'),
      testsFolder: string('tests'),
      typesFolder: string('types'),
    };
  }

  bootstrap() {
    this.setMetadata({
      bin: 'tsc',
      configName: 'tsconfig.json',
      configOption: '',
      description: this.tool.msg('app:typescriptDescription'),
      filterOptions: true,
      helpOption: '--help --all',
      title: 'TypeScript',
      watchOptions: ['-w', '--watch'],
      workspaceStrategy: 'copy',
    });

    this.setCommandOptions({
      clean: {
        boolean: true,
        default: false,
        description: this.tool.msg('app:typescriptCleanOption'),
      },
    });

    this.on('typescript.create-config-file', this.handlePrepareConfigs);
    this.on('typescript.before-execute', this.handleCleanTarget);
    this.on('typescript.before-execute', this.handleProjectReferences);
  }

  /**
   * Create a `tsconfig.json` in each workspace package. Automatically link packages
   * together using project references. Attempt to handle source and test folders.
   */
  createProjectRefConfigsInWorkspaces(workspaceRoot: string) {
    const { buildFolder, srcFolder, testsFolder, typesFolder, globalTypes } = this.options;
    const optionsConfigPath = path.join(workspaceRoot, 'tsconfig.options.json');
    const globalTypesPath = path.join(workspaceRoot, typesFolder, '**/*');
    const namesToPaths: { [key: string]: string } = {};
    const workspacePackages = this.tool.getWorkspacePackages<{
      tsconfig: Pick<TypeScriptConfig, 'compilerOptions' | 'exclude'>;
    }>({
      root: workspaceRoot,
    });

    // Map package name to absolute paths
    workspacePackages.forEach(wsPkg => {
      namesToPaths[wsPkg.name] = wsPkg.workspace.packagePath;
    });

    // Create a config file in each package
    workspacePackages.forEach(
      ({ dependencies = {}, peerDependencies = {}, tsconfig = {}, workspace }) => {
        const { packagePath } = workspace;
        const testsPath = path.join(packagePath, testsFolder);
        const references: ts.ProjectReference[] = [];

        // Extract and determine references
        Object.keys({ ...dependencies, ...peerDependencies }).forEach(depName => {
          if (namesToPaths[depName]) {
            references.push({ path: path.relative(packagePath, namesToPaths[depName]) });
          }
        });

        // Build package config
        const packageConfig = {
          compilerOptions: {
            declarationDir: buildFolder,
            outDir: buildFolder,
            rootDir: srcFolder,
            ...tsconfig.compilerOptions,
          },
          exclude: [buildFolder],
          extends: path.relative(packagePath, optionsConfigPath),
          include: [path.join(srcFolder, '**/*'), path.join(typesFolder, '**/*')],
          references,
        };

        if (globalTypes) {
          packageConfig.include.push(path.relative(packagePath, globalTypesPath));
        }

        if (Array.isArray(tsconfig.exclude)) {
          packageConfig.exclude.push(...tsconfig.exclude);
        }

        // Build tests specific package config
        if (testsFolder && fs.existsSync(testsPath)) {
          packageConfig.exclude.push(testsFolder);

          const testConfig = {
            compilerOptions: {
              emitDeclarationOnly: false,
              noEmit: true,
              rootDir: '.',
            },
            extends: path.relative(testsPath, optionsConfigPath),
            include: ['**/*', path.join('..', typesFolder, '**/*')],
            references: [{ path: '..' }],
          };

          if (globalTypes) {
            testConfig.include.push(path.relative(testsPath, globalTypesPath));
          }

          fs.writeFileSync(path.join(testsPath, 'tsconfig.json'), this.formatConfig(testConfig));
        }

        // Write the config file last
        fs.writeFileSync(path.join(packagePath, 'tsconfig.json'), this.formatConfig(packageConfig));
      },
    );
  }

  /**
   * Extract compiler options from the root config into a separate config purely for
   * extending options. Update the root config with references to all workspaces.
   */
  prepareProjectRefsRootConfigs(
    workspaceRoot: string,
    configPath: string,
    config: TypeScriptConfig,
  ): string {
    const { testsFolder } = this.options;
    const optionsPath = path.join(path.dirname(configPath), 'tsconfig.options.json');

    // Extract compiler options to a new config file
    fs.writeFileSync(
      optionsPath,
      this.formatConfig({
        compilerOptions: {
          ...config.compilerOptions,
          // Required for project references
          composite: true,
          declaration: true,
          declarationMap: true,
          // Remove by marking as undefined
          outDir: undefined,
          outFile: undefined,
        },
      }),
    );

    // Delete problematic root options
    delete config.compilerOptions;
    delete config.include;
    delete config.exclude;

    // Generate references and update paths
    config.extends = './tsconfig.options.json';
    config.files = [];
    config.references = [];

    this.tool.getWorkspacePackages({ root: workspaceRoot }).forEach(({ workspace }) => {
      config.references!.push({
        path: path.relative(workspaceRoot, workspace.packagePath),
      });

      // Reference a separate tests folder if it exists
      const testsPath = path.join(workspace.packagePath, testsFolder);

      if (testsFolder && fs.existsSync(testsPath)) {
        config.references!.push({
          path: path.relative(workspaceRoot, testsPath),
        });
      }
    });

    return optionsPath;
  }

  /**
   * Automatically clean the target folder if `outDir` and `--clean` is used.
   */
  private handleCleanTarget = ({ args }: DriverContext<DriverArgs & TypeScriptArgs>) => {
    const outDir =
      args.outDir || (this.config.compilerOptions && this.config.compilerOptions.outDir);

    if (args.clean && outDir) {
      rimraf.sync(path.resolve(outDir));
    }
  };

  /**
   * Define references and compiler options when `--reference-workspaces` option is passed.
   */
  private handlePrepareConfigs = (
    context: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>,
    configPath: string,
    config: TypeScriptConfig,
  ) => {
    const { args, workspaceRoot } = context;

    if (!args.referenceWorkspaces) {
      return;
    }

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath(
      'typescript',
      this.prepareProjectRefsRootConfigs(workspaceRoot, configPath, config),
    );
  };

  /**
   * Automatically create `tsconfig.json` files in each workspace package with project
   * references linked correctly. Requires the `--reference-workspaces` option.
   */
  private handleProjectReferences = ({
    args,
    workspaceRoot,
  }: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>) => {
    if (!args.referenceWorkspaces) {
      return;
    } else if (args.workspaces) {
      throw new Error(this.tool.msg('errors:workspacesMixedProjectRefs'));
    }

    this.createProjectRefConfigsInWorkspaces(workspaceRoot);
  };
}
