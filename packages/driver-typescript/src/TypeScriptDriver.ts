import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import ts from 'typescript';
import { Event } from '@boost/event';
import {
  Driver,
  DriverArgs,
  DriverContext,
  Predicates,
  ConfigContext,
  ConfigArgs,
} from '@beemo/core';
import { TypeScriptArgs, TypeScriptConfig, TypeScriptOptions } from './types';

// Use the same separator slashes on all platforms,
// so that config churn is reduced.
function normalize(filePath: string): string {
  return path.normalize(filePath).replace(/\\/gu, '/');
}

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig, TypeScriptOptions> {
  onCreateProjectConfigFile = new Event<[ConfigContext, string, TypeScriptConfig, boolean]>(
    'create-project-config-file',
  );

  blueprint(preds: Predicates) /* infer */ {
    const { bool, string } = preds;

    return {
      ...super.blueprint(preds),
      buildFolder: string('lib'),
      declarationOnly: bool(),
      globalTypes: bool(true),
      localTypes: bool(true),
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

    this.onCreateConfigFile.listen(this.handlePrepareConfigs);
    this.onBeforeExecute.listen(this.handleCleanTarget);
    this.onBeforeExecute.listen(this.handleProjectReferences);
  }

  /**
   * Create a `tsconfig.json` in each workspace package. Automatically link packages
   * together using project references. Attempt to handle source and test folders.
   */
  async createProjectRefConfigsInWorkspaces(
    context: DriverContext<DriverArgs & TypeScriptArgs>,
    workspaceRoot: string,
  ): Promise<unknown> {
    const {
      buildFolder,
      declarationOnly,
      srcFolder,
      testsFolder,
      typesFolder,
      globalTypes,
      localTypes,
    } = this.options;
    const optionsConfigPath = path.join(workspaceRoot, 'tsconfig.options.json');
    const globalTypesPath = path.join(workspaceRoot, typesFolder, '**/*');
    const namesToPaths: { [key: string]: string } = {};
    const workspacePackages = this.tool.getWorkspacePackages<{
      tsconfig: Pick<TypeScriptConfig, 'compilerOptions' | 'exclude'>;
    }>({
      root: workspaceRoot,
    });

    // Helper to write a file and return a promise
    const writeFile = (filePath: string, config: TypeScriptConfig, isTests: boolean) => {
      const configPath = path.join(filePath, 'tsconfig.json');

      if (config.extends) {
        config.extends = normalize(config.extends);
      }

      if (config.exclude) {
        config.exclude = config.exclude.map(normalize);
      }

      if (config.include) {
        config.include = config.include.map(normalize);
      }

      this.onCreateProjectConfigFile.emit([context, configPath, config, isTests]);

      return new Promise((resolve, reject) => {
        fs.writeFile(configPath, this.formatConfig(config), error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    };

    // Map package name to absolute paths
    workspacePackages.forEach(wsPkg => {
      namesToPaths[wsPkg.name] = wsPkg.workspace.packagePath;
    });

    // Create a config file in each package
    return Promise.all(
      workspacePackages.map(
        // eslint-disable-next-line complexity
        ({
          dependencies = {},
          devDependencies = {},
          peerDependencies = {},
          tsconfig = {},
          workspace,
        }) => {
          const { packagePath } = workspace;
          const srcPath = path.join(packagePath, srcFolder);
          const testsPath = path.join(packagePath, testsFolder);
          const references: ts.ProjectReference[] = [];
          const promises: Promise<unknown>[] = [];

          // Extract and determine references
          Object.keys({ ...dependencies, ...devDependencies, ...peerDependencies }).forEach(
            depName => {
              if (namesToPaths[depName]) {
                references.push({
                  path: normalize(path.relative(packagePath, namesToPaths[depName])),
                });
              }
            },
          );

          // Build package config
          if (srcFolder && fs.existsSync(srcPath)) {
            const packageConfig = {
              compilerOptions: {
                ...tsconfig.compilerOptions,
                declarationDir: buildFolder,
                outDir: buildFolder,
                rootDir: srcFolder,
              },
              exclude: [buildFolder],
              extends: path.relative(packagePath, optionsConfigPath),
              include: [path.join(srcFolder, '**/*')],
              references,
            };

            if (declarationOnly) {
              (packageConfig.compilerOptions as ts.CompilerOptions).emitDeclarationOnly = true;
            }

            if (localTypes) {
              packageConfig.include.push(path.join(typesFolder, '**/*'));
            }

            if (globalTypes) {
              packageConfig.include.push(path.relative(packagePath, globalTypesPath));
            }

            if (testsFolder) {
              packageConfig.exclude.push(testsFolder);
            }

            if (Array.isArray(tsconfig.exclude)) {
              packageConfig.exclude.push(...tsconfig.exclude);
            }

            promises.push(writeFile(packagePath, packageConfig, false));
          }

          // Build tests specific package config
          if (testsFolder && fs.existsSync(testsPath)) {
            const testConfig = {
              compilerOptions: {
                emitDeclarationOnly: false,
                noEmit: true,
                rootDir: '.',
              },
              extends: path.relative(testsPath, optionsConfigPath),
              include: ['**/*'],
              references: [{ path: '..' }],
            };

            if (localTypes) {
              testConfig.include.push(path.join('..', typesFolder, '**/*'));
            }

            if (globalTypes) {
              testConfig.include.push(path.relative(testsPath, globalTypesPath));
            }

            promises.push(writeFile(testsPath, testConfig, true));
          }

          return Promise.all(promises);
        },
      ),
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
    const { srcFolder, testsFolder } = this.options;
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
      const srcPath = path.join(workspace.packagePath, srcFolder);
      const testsPath = path.join(workspace.packagePath, testsFolder);

      // Reference a package *only* if it has a src folder
      if (srcFolder && fs.existsSync(srcPath)) {
        config.references!.push({
          path: path.relative(workspaceRoot, workspace.packagePath),
        });

        // Reference a separate tests folder if it exists
        if (testsFolder && fs.existsSync(testsPath)) {
          config.references!.push({
            path: path.relative(workspaceRoot, testsPath),
          });
        }
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

    return Promise.resolve();
  };

  /**
   * Define references and compiler options when `--reference-workspaces` option is passed.
   */
  private handlePrepareConfigs = (
    context: ConfigContext<ConfigArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>,
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
  private handleProjectReferences = (
    context: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>,
  ) => {
    const { args, workspaceRoot } = context;

    if (!args.referenceWorkspaces) {
      return Promise.resolve();
    } else if (!args.build && !args.b) {
      throw new Error(this.tool.msg('errors:workspacesProjectRefsBuildRequired'));
    } else if (args.workspaces) {
      throw new Error(this.tool.msg('errors:workspacesProjectRefsMixed'));
    }

    return this.createProjectRefConfigsInWorkspaces(context, workspaceRoot);
  };
}
