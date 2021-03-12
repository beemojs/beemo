import fs from 'fs';
import rimraf from 'rimraf';
import ts from 'typescript';
import {
  Blueprint,
  ConfigContext,
  Driver,
  DriverContext,
  PackageStructure,
  Path,
  Predicates,
} from '@beemo/core';
import { Event } from '@boost/event';
import syncProjectRefs from './commands/syncProjectRefs';
import { TypeScriptConfig, TypeScriptOptions } from './types';

function join(...parts: string[]): string {
  return new Path(...parts).path();
}

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig, TypeScriptOptions> {
  readonly name = '@beemo/driver-typescript';

  readonly onCreateProjectConfigFile = new Event<[ConfigContext, Path, TypeScriptConfig, boolean]>(
    'create-project-config-file',
  );

  blueprint(preds: Predicates): Blueprint<TypeScriptOptions> {
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
      commandOptions: {
        clean: {
          default: false,
          description: this.tool.msg('app:typescriptCleanOption'),
          type: 'boolean',
        },
      },
      configName: 'tsconfig.json',
      configOption: '',
      description: this.tool.msg('app:typescriptDescription'),
      helpOption: '--help --all',
      title: 'TypeScript',
      watchOptions: ['-w', '--watch'],
      workspaceStrategy: 'copy',
    });

    // TODO
    this.registerCommand('sync-project-refs', { description: '' }, syncProjectRefs);

    this.onBeforeExecute.listen(this.handleCleanTarget);
    this.onBeforeExecute.listen(this.handleProjectReferences);
  }

  /**
   * Create a `tsconfig.json` in each workspace package. Automatically link packages
   * together using project references. Attempt to handle source and test folders.
   */
  async createProjectRefConfigsInWorkspaces(
    context: DriverContext,
    workspaceRoot: Path,
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
    const optionsConfigPath = workspaceRoot.append('tsconfig.options.json');
    const globalTypesPath = workspaceRoot.append(typesFolder, '**/*');
    const namesToPaths: { [key: string]: string } = {};
    const workspacePackages = this.tool.project.getWorkspacePackages<
      PackageStructure & {
        tsconfig: Pick<TypeScriptConfig, 'compilerOptions' | 'exclude' | 'include'>;
      }
    >();

    // Helper to write a file and return a promise
    const writeFile = (filePath: Path, config: TypeScriptConfig, isTests: boolean) => {
      const configPath = filePath.append('tsconfig.json');

      this.onCreateProjectConfigFile.emit([context, configPath, config, isTests]);

      return new Promise((resolve, reject) => {
        fs.writeFile(configPath.path(), this.formatConfig(config), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      });
    };

    // Map package name to absolute paths
    workspacePackages.forEach((wsPkg) => {
      namesToPaths[wsPkg.package.name] = wsPkg.metadata.packagePath;
    });

    // Create a config file in each package
    return Promise.all(
      workspacePackages.map(
        // eslint-disable-next-line complexity
        ({
          package: {
            dependencies = {},
            devDependencies = {},
            peerDependencies = {},
            tsconfig = {},
          },
          metadata: workspace,
        }) => {
          const pkgPath = new Path(workspace.packagePath);
          const srcPath = pkgPath.append(srcFolder);
          const testsPath = pkgPath.append(testsFolder);
          const references: ts.ProjectReference[] = [];
          const promises: Promise<unknown>[] = [];

          // Extract and determine references
          Object.keys({ ...dependencies, ...devDependencies, ...peerDependencies }).forEach(
            (depName) => {
              if (namesToPaths[depName]) {
                references.push({
                  path: pkgPath.relativeTo(namesToPaths[depName]).path(),
                });
              }
            },
          );

          // Build package config
          if (srcFolder && srcPath.exists()) {
            const packageConfig = {
              compilerOptions: {
                ...tsconfig.compilerOptions,
                declarationDir: buildFolder,
                outDir: buildFolder,
                rootDir: srcFolder,
              },
              exclude: [buildFolder],
              extends: pkgPath.relativeTo(optionsConfigPath).path(),
              include: [join(srcFolder, '**/*')],
              references,
            };

            if (declarationOnly) {
              (packageConfig.compilerOptions as ts.CompilerOptions).emitDeclarationOnly = true;
            }

            if (localTypes) {
              packageConfig.include.push(join(typesFolder, '**/*'));
            }

            if (globalTypes) {
              packageConfig.include.push(pkgPath.relativeTo(globalTypesPath).path());
            }

            if (testsFolder) {
              packageConfig.exclude.push(testsFolder);
            }

            if (Array.isArray(tsconfig.include)) {
              packageConfig.include.push(...tsconfig.include);
            }

            if (Array.isArray(tsconfig.exclude)) {
              packageConfig.exclude.push(...tsconfig.exclude);
            }

            promises.push(writeFile(pkgPath, packageConfig, false));
          }

          // Build tests specific package config
          if (testsFolder && testsPath.exists()) {
            const testConfig = {
              compilerOptions: {
                composite: false,
                emitDeclarationOnly: false,
                noEmit: true,
                rootDir: '.',
              },
              extends: testsPath.relativeTo(optionsConfigPath).path(),
              include: ['**/*'],
              references: [{ path: '..' }],
            };

            if (localTypes) {
              testConfig.include.push(join('..', typesFolder, '**/*'));
            }

            if (globalTypes) {
              testConfig.include.push(testsPath.relativeTo(globalTypesPath).path());
            }

            promises.push(writeFile(testsPath, testConfig, true));
          }

          return Promise.all(promises);
        },
      ),
    );
  }

  /**
   * Automatically clean the target folder if `outDir` and `--clean` is used.
   */
  private handleCleanTarget = (context: DriverContext) => {
    const outDir = context.getRiskyOption('outDir', true) || this.config.compilerOptions?.outDir;

    if (context.getRiskyOption('clean') && typeof outDir === 'string' && outDir) {
      rimraf.sync(Path.resolve(outDir).path());
    }

    return Promise.resolve();
  };

  /**
   * Automatically create `tsconfig.json` files in each workspace package with project
   * references linked correctly. Requires the `--reference-workspaces` option.
   */
  private handleProjectReferences = (context: DriverContext) => {
    if (!context.getRiskyOption('referenceWorkspaces')) {
      return Promise.resolve();
    } else if (!context.getRiskyOption('build') && !context.getRiskyOption('b')) {
      throw new Error(this.tool.msg('errors:workspacesProjectRefsBuildRequired'));
    } else if (context.getOption('workspaces')) {
      throw new Error(this.tool.msg('errors:workspacesProjectRefsMixed'));
    }

    return this.createProjectRefConfigsInWorkspaces(context, context.workspaceRoot);
  };
}
