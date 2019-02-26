import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import ts from 'typescript';
import { Driver, DriverArgs, DriverContext } from '@beemo/core';
import { TypeScriptArgs, TypeScriptConfig, TypeScriptOptions } from './types';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig, TypeScriptOptions> {
  blueprint(preds: any) /* infer */ {
    const { string } = preds;

    return {
      ...super.blueprint(preds),
      buildFolder: string('./lib'),
      srcFolder: string('./src'),
      testFolder: string('./tests'),
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
    {
      args,
      workspaceRoot,
    }: DriverContext<DriverArgs & TypeScriptArgs & { referenceWorkspaces?: boolean }>,
    configPath: string,
    config: TypeScriptConfig,
  ) => {
    if (!args.referenceWorkspaces) {
      return;
    }

    // Always include
    config.compilerOptions!.composite = true;
    config.compilerOptions!.declaration = true;
    config.compilerOptions!.declarationMap = true;

    // Disable root compilation
    config.files = [];
    config.include = [];
    config.exclude = [];

    // Generate references
    config.references = [];

    this.tool.getWorkspacePackages({ root: workspaceRoot }).forEach(wsPkg => {
      config.references!.push({
        path: `./${path.relative(workspaceRoot, wsPkg.workspace.packagePath)}`,
      });
    });
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
      // TODO translate
      throw new Error('--workspaces and --reference-workspaces cannot be used in unison.');
    } else if (!args.build) {
      // TODO translate
      throw new Error('--build must be passed when using --reference-workspaces.');
    }

    const { buildFolder, srcFolder, testFolder } = this.options;
    const rootConfigPath = path.join(workspaceRoot, 'tsconfig.json');
    const namesToPaths: { [key: string]: string } = {};
    const workspacePackages = this.tool.getWorkspacePackages({
      root: workspaceRoot,
    });

    // Map package name to absolute paths
    workspacePackages.forEach(wsPkg => {
      namesToPaths[wsPkg.name] = wsPkg.workspace.packagePath;
    });

    // Create a config file in each package
    workspacePackages.forEach(({ dependencies = {}, peerDependencies = {}, workspace }) => {
      const references: ts.ProjectReference[] = [];

      // Extract and determine references
      Object.keys({ ...dependencies, ...peerDependencies }).forEach(depName => {
        if (namesToPaths[depName]) {
          references.push({ path: path.relative(workspace.packagePath, namesToPaths[depName]) });
        }
      });

      // Write the config file
      function writeConfigFile(forTests: boolean = false) {
        const config: TypeScriptConfig = {
          compilerOptions: {
            rootDir: forTests ? testFolder : srcFolder,
          },
          extends: path.relative(workspace.packagePath, rootConfigPath),
          references,
        };

        if (forTests) {
          config.compilerOptions!.noEmit = true;
        } else {
          config.compilerOptions!.outDir = buildFolder;
        }

        fs.writeFileSync(
          path.join(workspace.packagePath, forTests ? 'tsconfig.test.json' : 'tsconfig.json'),
          JSON.stringify(config, null, 2),
        );
      }

      writeConfigFile();
      writeConfigFile(true);
    });
  };
}
