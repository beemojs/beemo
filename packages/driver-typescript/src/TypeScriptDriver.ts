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
    const { string } = preds;

    return {
      ...super.blueprint(preds),
      buildFolder: string('lib'),
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

    this.on('typescript.create-config-file', this.handleCreateConfig);
    this.on('typescript.before-execute', this.handleCleanTarget);
    this.on('typescript.before-execute', this.handleProjectReferences);
  }

  /**
   * Automatically clean the target folder if `outDir` and `--clean` is used.
   */
  handleCleanTarget = ({ args }: DriverContext<DriverArgs & TypeScriptArgs>) => {
    const outDir =
      args.outDir || (this.config.compilerOptions && this.config.compilerOptions.outDir);

    if (args.clean && outDir) {
      rimraf.sync(path.resolve(outDir));
    }
  };

  /**
   * Define references and compiler options when `--reference-workspaces` option is passed.
   */
  handleCreateConfig = (
    context: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>,
    configPath: string,
    config: TypeScriptConfig,
  ) => {
    const { args, workspaceRoot } = context;
    const { testsFolder } = this.options;

    if (!args.referenceWorkspaces) {
      return;
    }

    // Extract compiler options to a new config file
    const optionsPath = path.join(path.dirname(configPath), 'tsconfig.options.json');

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

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('typescript', optionsPath);
  };

  /**
   * Automatically create `tsconfig.json` files in each workspace package with project
   * references linked correctly. Requires the `--reference-workspaces` option.
   */
  handleProjectReferences = ({
    args,
    workspaceRoot,
  }: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>) => {
    if (!args.referenceWorkspaces) {
      return;
    } else if (args.workspaces) {
      throw new Error(this.tool.msg('errors:workspacesMixedProjectRefs'));
    }

    const { buildFolder, srcFolder, testsFolder, typesFolder } = this.options;
    const optionsConfigPath = path.join(workspaceRoot, 'tsconfig.options.json');
    const namesToPaths: { [key: string]: string } = {};
    const workspacePackages = this.tool.getWorkspacePackages<{
      tsconfig: Pick<TypeScriptConfig, 'exclude'>;
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
        const srcPath = workspace.packagePath;
        const references: ts.ProjectReference[] = [];

        // Extract and determine references
        Object.keys({ ...dependencies, ...peerDependencies }).forEach(depName => {
          if (namesToPaths[depName]) {
            references.push({ path: path.relative(srcPath, namesToPaths[depName]) });
          }
        });

        // Build package config
        const config: TypeScriptConfig = {
          compilerOptions: {
            declarationDir: buildFolder,
            outDir: buildFolder,
            rootDir: srcFolder,
          },
          exclude: [buildFolder],
          extends: path.relative(srcPath, optionsConfigPath),
          include: [path.join(srcFolder, '**/*'), path.join(typesFolder, '**/*')],
          references,
        };

        if (testsFolder) {
          config.exclude!.push(testsFolder);
        }

        if (Array.isArray(tsconfig.exclude)) {
          config.exclude!.push(...tsconfig.exclude);
        }

        fs.writeFileSync(path.join(srcPath, 'tsconfig.json'), this.formatConfig(config));

        // Build tests specific package config
        const testsPath = path.join(workspace.packagePath, testsFolder);

        if (testsFolder && fs.existsSync(testsPath)) {
          fs.writeFileSync(
            path.join(testsPath, 'tsconfig.json'),
            this.formatConfig({
              compilerOptions: {
                noEmit: true,
                rootDir: '.',
              },
              extends: path.relative(testsPath, optionsConfigPath),
              include: ['**/*', path.join('..', typesFolder)],
              references: [{ path: '..' }],
            }),
          );
        }
      },
    );
  };
}
