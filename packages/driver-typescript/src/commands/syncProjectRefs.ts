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

				// Build tests specific package config
				if (testsFolder && testsPath.exists()) {
					const testConfig: TypeScriptConfig = {
						compilerOptions: {
							composite: false,
							emitDeclarationOnly: false,
							noEmit: true,
							rootDir: '.',
						},
						extends: join(testsPath.relativeTo(optionsConfigPath)),
						include: ['**/*'],
						references: [{ path: '..' }],
					};

					if (localTypes) {
						testConfig.include!.push(join('..', typesFolder, '**/*'));
					}

					if (globalTypes) {
						testConfig.include!.push(join(testsPath.relativeTo(globalTypesPath)));
					}

					const configPath = testsPath.append('tsconfig.json');

					driver.onCreateProjectConfigFile.emit([configPath, testConfig, true]);

					promises.push(writeFile(configPath, testConfig));
				}

				return Promise.all(promises);
			},
		),
	);
}
