import fs from 'fs';
import ts from 'typescript';
import { PackageStructure, Path, Tool } from '@beemo/core';
import type { TypeScriptConfig } from '../types';
import type TypeScriptDriver from '../TypeScriptDriver';

function join(...parts: string[]): string {
  return new Path(...parts).path();
}

function readFile(path: Path): Promise<TypeScriptConfig> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.path(), 'utf8', (error, contents) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(contents));
      }
    });
  });
}

function writeFile(path: Path, data: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.path(), JSON.stringify(data, null, 2), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Extract compiler options from the root config into a separate config purely for
 * extending options. Update the root config with references to all workspaces.
 */
async function addProjectRefsToRootConfig(tool: Tool, driver: TypeScriptDriver) {
  const { root } = tool.project;
  const { srcFolder, testsFolder } = driver.options;
  const configPath = root.append('tsconfig.json');
  const optionsConfigPath = root.append('tsconfig.options.json');

  // Load both configs
  const config = await readFile(configPath);
  const optionsConfig = await readFile(optionsConfigPath);

  // Update compiler options
  Object.assign(optionsConfig.compilerOptions, {
    composite: true,
    declaration: true,
    declarationMap: true,
    outDir: undefined,
    outFile: undefined,
  });

  // Delete problematic root options
  delete config.compilerOptions;
  delete config.include;
  delete config.exclude;

  // Generate references and update paths
  config.extends = './tsconfig.options.json';
  config.files = [];
  config.references = [];

  tool.project.getWorkspacePackages().forEach(({ metadata }) => {
    const pkgPath = new Path(metadata.packagePath);
    const srcPath = pkgPath.append(srcFolder);
    const testsPath = pkgPath.append(testsFolder);

    // Reference a package *only* if it has a src folder
    if (srcFolder && srcPath.exists()) {
      config.references!.push({
        path: root.relativeTo(pkgPath).path(),
      });

      // Reference a separate tests folder if it exists
      if (testsFolder && testsPath.exists()) {
        config.references!.push({
          path: root.relativeTo(testsPath).path(),
        });
      }
    }
  });

  // Write updated config files
  await writeFile(configPath, config);
  await writeFile(optionsConfigPath, optionsConfig);
}

/**
 * Create a `tsconfig.json` in each workspace package. Automatically link packages
 * together using project references. Attempt to handle source and test folders.
 */
async function createProjectRefConfigsInWorkspaces(
  tool: Tool,
  driver: TypeScriptDriver,
): Promise<unknown> {
  const { root } = tool.project;
  const {
    buildFolder,
    declarationOnly,
    srcFolder,
    testsFolder,
    typesFolder,
    globalTypes,
    localTypes,
  } = driver.options;
  const optionsConfigPath = root.append('tsconfig.options.json');
  const globalTypesPath = root.append(typesFolder, '**/*');
  const namesToPaths: Record<string, string> = {};
  const workspacePackages = tool.project.getWorkspacePackages<
    PackageStructure & {
      tsconfig?: Pick<TypeScriptConfig, 'compilerOptions' | 'exclude' | 'include'>;
    }
  >();

  // Map package name to absolute paths
  workspacePackages.forEach((wsPkg) => {
    namesToPaths[wsPkg.package.name] = wsPkg.metadata.packagePath;
  });

  // Create a config file in each package
  return Promise.all(
    workspacePackages.map(
      // eslint-disable-next-line complexity
      ({
        package: { dependencies = {}, devDependencies = {}, peerDependencies = {}, tsconfig = {} },
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
          const packageConfig: TypeScriptConfig = {
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
            packageConfig.compilerOptions!.emitDeclarationOnly = true;
          }

          if (localTypes) {
            packageConfig.include!.push(join(typesFolder, '**/*'));
          }

          if (globalTypes) {
            packageConfig.include!.push(pkgPath.relativeTo(globalTypesPath).path());
          }

          if (testsFolder) {
            packageConfig.exclude!.push(testsFolder);
          }

          if (Array.isArray(tsconfig.include)) {
            packageConfig.include!.push(...tsconfig.include);
          }

          if (Array.isArray(tsconfig.exclude)) {
            packageConfig.exclude!.push(...tsconfig.exclude);
          }

          promises.push(writeFile(pkgPath.append('tsconfig.json'), packageConfig));
        }

        // Build tests specific package config
        if (testsFolder && testsPath.exists()) {
          const testConfig: TypeScriptConfig = {
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
            testConfig.include!.push(join('..', typesFolder, '**/*'));
          }

          if (globalTypes) {
            testConfig.include!.push(testsPath.relativeTo(globalTypesPath).path());
          }

          promises.push(writeFile(testsPath.append('tsconfig.json'), testConfig));
        }

        return Promise.all(promises);
      },
    ),
  );
}

export default async function syncProjectRefs(tool: Tool) {
  const driver = tool.driverRegistry.get<TypeScriptDriver>('typescript');

  await addProjectRefsToRootConfig(tool, driver);
  await createProjectRefConfigsInWorkspaces(tool, driver);
}
