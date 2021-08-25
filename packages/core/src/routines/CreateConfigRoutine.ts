/* eslint-disable @typescript-eslint/member-ordering */

import fs from 'fs-extra';
import camelCase from 'lodash/camelCase';
import { Bind, Blueprint, Path, PathResolver, Predicates } from '@boost/common';
import { color } from '@boost/internal';
import { requireModule } from '@boost/module';
import { Routine } from '@boost/pipeline';
import {
	STRATEGY_COPY,
	STRATEGY_CREATE,
	STRATEGY_NATIVE,
	STRATEGY_REFERENCE,
	STRATEGY_TEMPLATE,
} from '../constants';
import { ConfigContext } from '../contexts/ConfigContext';
import { Driver } from '../Driver';
import type { Tool } from '../Tool';
import { ConfigObject, ConfigTemplate, RoutineOptions } from '../types';

export interface CreateConfigOptions extends RoutineOptions {
	driver: Driver;
}

export class CreateConfigRoutine<Ctx extends ConfigContext> extends Routine<
	Path,
	unknown,
	CreateConfigOptions
> {
	blueprint({ instance }: Predicates): Blueprint<CreateConfigOptions> {
		return {
			// @ts-expect-error Errors because Driver is abstract
			driver: instance(Driver).required().notNullable(),
			tool: instance<Tool>().required().notNullable(),
		};
	}

	async execute(context: Ctx): Promise<Path> {
		const { driver, tool } = this.options;
		const { metadata, options } = driver;
		const name = metadata.title;
		const strategy =
			options.configStrategy === STRATEGY_NATIVE ? metadata.configStrategy : options.configStrategy;

		switch (strategy) {
			case STRATEGY_REFERENCE:
				return this.createWaterfallPipeline(context, [])
					.pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
					.pipe(tool.msg('app:configReference', { name }), this.referenceConfigFile)
					.run();

			case STRATEGY_COPY:
				return this.createWaterfallPipeline(context, [])
					.pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
					.pipe(tool.msg('app:configCopy', { name }), this.copyConfigFile)
					.run();

			case STRATEGY_CREATE:
				return this.createWaterfallPipeline(context, [])
					.pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
					.pipe(tool.msg('app:configCreateLoadProvider', { name }), this.loadConfigFromProvider)
					.pipe(tool.msg('app:configCreateLoadConsumer', { name }), this.loadConfigFromConsumer)
					.pipe(tool.msg('app:configCreateMerge', { name }), this.mergeConfigs)
					.pipe(tool.msg('app:configCreate', { name }), this.createConfigFile)
					.run();

			case STRATEGY_TEMPLATE:
				return this.createWaterfallPipeline(context, [])
					.pipe(tool.msg('app:configSetEnvVars', { name }), this.setEnvVars)
					.pipe(tool.msg('app:configCreateLoadProvider', { name }), this.loadConfigFromProvider)
					.pipe(tool.msg('app:configCreateLoadConsumer', { name }), this.loadConfigFromConsumer)
					.pipe(
						tool.msg('app:configCreateFromTemplate', { name }),
						this.createConfigFileFromTemplate,
					)
					.run();

			default:
				this.skip(true);
				break;
		}

		return Promise.resolve(new Path());
	}

	/**
	 * Copy configuration file from module.
	 */
	@Bind()
	async copyConfigFile(context: Ctx): Promise<Path> {
		const { driver, tool } = this.options;
		const { metadata } = driver;
		const sourcePath = this.getConfigPath(context);
		const configPath = context.cwd.append(metadata.configName);

		if (!sourcePath) {
			throw new Error(tool.msg('errors:configCopySourceMissing'));
		}

		const config = this.loadConfigAtPath(sourcePath);

		this.debug('Copying config file to %s', color.filePath(configPath));

		driver.config = config;
		driver.onCopyConfigFile.emit([context, configPath, config]);

		context.addConfigPath(driver.getName(), configPath);

		await fs.copy(sourcePath.path(), configPath.path(), {
			overwrite: true,
		});

		return configPath;
	}

	/**
	 * Create a temporary configuration file or pass as an option.
	 */
	@Bind()
	async createConfigFile(context: Ctx, config: ConfigObject): Promise<Path> {
		const { driver } = this.options;
		const { metadata } = driver;
		const configPath = context.cwd.append(metadata.configName);

		this.debug('Creating config file %s', color.filePath(configPath));

		driver.config = config;
		driver.onCreateConfigFile.emit([context, configPath, config]);

		context.addConfigPath(driver.getName(), configPath);

		await fs.writeFile(configPath.path(), this.options.driver.formatConfig(config));

		return configPath;
	}

	/**
	 * Create a configuration file for the defined driver based on a custom template
	 * provided by the consumer.
	 */
	@Bind()
	async createConfigFileFromTemplate(context: Ctx, configs: ConfigObject[]): Promise<Path> {
		const { driver, tool } = this.options;
		const { metadata } = driver;
		const driverConfigPath = context.cwd.append(metadata.configName);
		const templatePath = Path.resolve(driver.options.template, context.cwd.append('.config'));
		let template: ConfigTemplate;

		if (!driver.options.template) {
			throw new Error(tool.msg('errors:templateRequired'));
		}

		try {
			template = requireModule<ConfigTemplate>(templatePath).default;
		} catch {
			throw new Error(
				tool.msg('errors:templatePathMissing', {
					path: templatePath.name(),
				}),
			);
		}

		if (typeof template !== 'function') {
			throw new TypeError(
				tool.msg('errors:templateTypeInvalid', {
					type: typeof template,
				}),
			);
		}

		const { config, path = driverConfigPath } = template(configs, {
			configModule: tool.config.module,
			consumerConfigPath: this.getConfigPath(context, true),
			context,
			driver,
			driverConfigPath,
			driverName: driver.getName(),
			providerConfigPath: this.getConfigPath(context),
			templatePath,
			tool,
		});

		// Allow the config path to be altered
		const configPath = Path.resolve(path, context.cwd);

		context.addConfigPath(driver.getName(), configPath);

		driver.config = typeof config === 'string' ? {} : config;
		driver.onTemplateConfigFile.emit([context, configPath, config]);

		await fs.writeFile(
			configPath.path(),
			typeof config === 'string' ? config : this.options.driver.formatConfig(config),
		);

		return configPath;
	}

	/**
	 * Return an absolute file path for a config file in either the consumer or provider.
	 */
	getConfigPath({ cwd, workspaceRoot }: Ctx, fromConsumer: boolean = false): Path | null {
		const { projectName } = this.options.tool.options;
		const moduleName = this.options.tool.config.module;
		const driverName = this.options.driver.getName();
		const configName = camelCase(driverName);
		const resolver = new PathResolver();
		const root = workspaceRoot || cwd;
		let debugMessage = '';

		// When loading from the consumer (project in which beemo is running),
		// we look for config files in a `beemo` folder relative to the root
		// `.config/beemo.js` config file.
		if (fromConsumer) {
			debugMessage = `Loading ${color.symbol(driverName)} config from local project as an override`;

			resolver
				.lookupFilePath(`.config/${projectName}/${configName}.ts`, root)
				.lookupFilePath(`.config/${projectName}/${configName}.js`, root);

			// When loading from the provider (upstream configuratiob module),
			// we look for a config file in multiple places, in an attempt to
			// support both source and pre-built formats.
		} else {
			debugMessage = `Loading ${color.symbol(
				driverName,
			)} config from configuration module ${color.moduleName(moduleName)}`;

			// If module name is @local, allow for local development
			// by looking for config files in the current project.
			if (moduleName === '@local') {
				resolver
					.lookupFilePath(`configs/${configName}.ts`, root)
					.lookupFilePath(`configs/${configName}.js`, root)
					.lookupFilePath(`src/configs/${configName}.ts`, root)
					.lookupFilePath(`lib/configs/${configName}.js`, root);
			} else {
				resolver
					.lookupNodeModule(`${moduleName}/configs/${configName}.ts`)
					.lookupNodeModule(`${moduleName}/configs/${configName}.js`)
					.lookupNodeModule(`${moduleName}/src/configs/${configName}.ts`)
					.lookupNodeModule(`${moduleName}/lib/configs/${configName}.js`);
			}
		}

		let configPath = null;

		try {
			configPath = resolver.resolvePath();
		} catch {
			// Ignore
		}

		this.debug.invariant(!!configPath, debugMessage, 'Exists, loading', 'Does not exist, skipping');

		if (configPath) {
			this.debug('Found at %s', color.filePath(configPath));
		}

		return configPath;
	}

	/**
	 * Merge multiple configuration sources using the current driver.
	 */
	@Bind()
	async mergeConfigs(context: Ctx, configs: ConfigObject[]): Promise<ConfigObject> {
		const { driver } = this.options;

		this.debug('Merging %s config from %d sources', color.symbol(driver.getName()), configs.length);

		// eslint-disable-next-line unicorn/prefer-object-from-entries
		const config = configs.reduce(
			(masterConfig, cfg) => this.options.driver.mergeConfig(masterConfig, cfg),
			{},
		);

		driver.onMergeConfig.emit([context, config]);

		return Promise.resolve(config);
	}

	/**
	 * Load a config file with passing the args and tool to the file.
	 */
	loadConfigAtPath(filePath: Path): ConfigObject {
		const config = requireModule<ConfigObject>(filePath).default;

		if (typeof config === 'function') {
			throw new TypeError(
				this.options.tool.msg('errors:configNoFunction', {
					name: filePath.name(),
				}),
			);
		}

		return config;
	}

	/**
	 * Load config from the consumer / local overrides.
	 */
	@Bind()
	async loadConfigFromConsumer(context: Ctx, prevConfigs: ConfigObject[]): Promise<ConfigObject[]> {
		const sourcePath = this.getConfigPath(context, true);
		const configs = [...prevConfigs];

		if (sourcePath) {
			const config = this.loadConfigAtPath(sourcePath);

			configs.push(config);

			this.options.driver.onLoadConsumerConfig.emit([context, config]);
		}

		return Promise.resolve(configs);
	}

	/**
	 * Load config from the provider / configuration module.
	 */
	@Bind()
	async loadConfigFromProvider(context: Ctx, prevConfigs: ConfigObject[]): Promise<ConfigObject[]> {
		const sourcePath = this.getConfigPath(context);
		const configs = [...prevConfigs];

		if (sourcePath) {
			const config = this.loadConfigAtPath(sourcePath);

			configs.push(config);

			this.options.driver.onLoadProviderConfig.emit([context, sourcePath, config]);
		}

		return Promise.resolve(configs);
	}

	/**
	 * Reference configuration file from module using a require statement.
	 */
	@Bind()
	async referenceConfigFile(context: Ctx): Promise<Path> {
		const { driver, tool } = this.options;
		const { metadata } = driver;
		const sourcePath = this.getConfigPath(context);
		const configPath = context.cwd.append(metadata.configName);

		if (!sourcePath) {
			throw new Error(tool.msg('errors:configReferenceSourceMissing'));
		}

		const config = this.loadConfigAtPath(sourcePath);

		this.debug('Referencing config file to %s', color.filePath(configPath));

		driver.config = config;
		driver.onReferenceConfigFile.emit([context, configPath, config]);

		context.addConfigPath(driver.getName(), configPath);

		const requirePath = context.cwd.relativeTo(sourcePath);

		await fs.writeFile(configPath.path(), `module.exports = require('./${requirePath}');`);

		return configPath;
	}

	/**
	 * Set environment variables defined by the driver.
	 */
	@Bind()
	setEnvVars(context: Ctx, configs: ConfigObject[]): ConfigObject[] {
		const { env } = this.options.driver.options;

		// TODO: This may cause collisions, isolate somehow?
		Object.keys(env).forEach((key) => {
			process.env[key] = env[key];
		});

		return configs;
	}
}
