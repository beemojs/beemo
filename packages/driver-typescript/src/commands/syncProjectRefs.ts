import fs from 'fs';
import { Path, Tool } from '@beemo/core';
import type { TypeScriptConfig } from '../types';
import type TypeScriptDriver from '../TypeScriptDriver';

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

  // Load root config
  const config = await readFile(configPath);

  // Extract root compiler options to a new config file
  await writeFile(optionsConfigPath, {
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

  // Write the new config file
  await writeFile(configPath, config);
}

export default async function syncProjectRefs(tool: Tool) {
  // Load the TS driver so we have access to its configured options
  const driver = (await tool.driverRegistry.load('typescript')) as TypeScriptDriver;

  // Add `references` to the root config file
  await addProjectRefsToRootConfig(tool, driver);
}
