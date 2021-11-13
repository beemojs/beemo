import ts from 'typescript';
import { PackageStructure, Path, Tool } from '@beemo/core';
import { join, writeFile } from '../helpers';
import type { TypeScriptConfig } from '../types';
import type { TypeScriptDriver } from '../TypeScriptDriver';

/**
 * Create a `tsconfig.json` in each workspace package. Automatically link packages
 * together using project references. Attempt to handle source and test folders.
 */
export async function syncProjectRefs(tool: Tool) {
	const driver = tool.driverRegistry.get<TypeScriptDriver>('typescript');
	const { root } = tool.project;
	const {
		buildFolder,
		declarationOnly,
		devFolders = [],
		srcFolder,
		testsFolder,
		typesFolder,
		globalTypes,
		localTypes,
	} = driver.options;
	const optionsConfigPath = root.append('tsconfig.options.json');
	const globalTypesPath = root.append(typesFolder, '**/*');
	const namesToPaths: Record<string, Path> = {};
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
	await Promise.all(
		workspacePackages.map(
			({
				package: { dependencies = {}, devDependencies = {}, peerDependencies = {}, tsconfig = {} },
				metadata: workspace,
			}) => {
				const pkgPath = new Path(workspace.packagePath);
				const srcPath = pkgPath.append(srcFolder);
				const references: ts.ProjectReference[] = [];
				const promises: Promise<unknown>[] = [];

				// Extract and determine references
				Object.keys({ ...dependencies, ...devDependencies, ...peerDependencies }).forEach(
					(depName) => {
						if (namesToPaths[depName]) {
							references.push({
								path: join(pkgPath.relativeTo(namesToPaths[depName])),
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
						extends: join(pkgPath.relativeTo(optionsConfigPath)),
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
						packageConfig.include!.push(join(pkgPath.relativeTo(globalTypesPath)));
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

					const configPath = pkgPath.append('tsconfig.json');

					driver.onCreateProjectConfigFile.emit([configPath, packageConfig, false]);
					promises.push(writeFile(configPath, packageConfig));
				}

				// Build tests/other specific package config after src
				const nestedRootPaths: Path[] = [];

				if (testsFolder && pkgPath.append(testsFolder).exists()) {
					nestedRootPaths.push(pkgPath.append(testsFolder));
				}

				devFolders.forEach((devFolder) => {
					if (devFolder && pkgPath.append(devFolder).exists()) {
						nestedRootPaths.push(pkgPath.append(devFolder));
					}
				});

				nestedRootPaths.forEach((dirPath) => {
					const relPathToRoot = join(dirPath.relativeTo(pkgPath));
					const nestedConfig: TypeScriptConfig = {
						compilerOptions: {
							composite: false,
							emitDeclarationOnly: false,
							noEmit: true,
							rootDir: '.',
						},
						extends: join(dirPath.relativeTo(optionsConfigPath)),
						include: ['**/*'],
						references: [{ path: relPathToRoot }],
					};

					if (localTypes) {
						nestedConfig.include!.push(join(relPathToRoot, typesFolder, '**/*'));
					}

					if (globalTypes) {
						nestedConfig.include!.push(join(dirPath.relativeTo(globalTypesPath)));
					}

					const configPath = dirPath.append('tsconfig.json');

					driver.onCreateProjectConfigFile.emit([configPath, nestedConfig, true]);

					promises.push(writeFile(configPath, nestedConfig));
				});

				return Promise.all(promises);
			},
		),
	);
}
