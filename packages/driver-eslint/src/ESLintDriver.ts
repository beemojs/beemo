import fs from 'fs';
import { ConfigContext, Driver, Execution, Path } from '@beemo/core';
import { Event } from '@boost/event';
import { ESLintArgs, ESLintConfig } from './types';

// Success: Writes warnings to stdout
// Failure: Writes failures to stderr
export class ESLintDriver extends Driver<ESLintConfig> {
	override readonly name = '@beemo/driver-eslint';

	readonly onCreateIgnoreFile = new Event<[ConfigContext, Path, { ignore: string[] }]>(
		'create-ignore-file',
	);

	override bootstrap() {
		this.setMetadata({
			bin: 'eslint',
			configName: '.eslintrc.js',
			description: this.tool.msg('app:eslintDescription'),
			title: 'ESLint',
		});

		this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
	}

	/**
	 * ESLint writes warnings to stdout, so we need to display
	 * both stdout and stderr on failure.
	 */
	override processFailure(error: Execution) {
		const { stderr, stdout } = error;

		if (stderr) {
			this.setOutput('stderr', stderr);
		}

		if (stdout) {
			this.setOutput('stdout', stdout);
		}
	}

	/**
	 * If an "ignore" property exists in the ESLint config, create an ".eslintignore" file.
	 */
	private handleCreateIgnoreFile = (
		context: ConfigContext<ESLintArgs>,
		configPath: Path,
		config: ESLintConfig,
	) => {
		if (!config.ignore) {
			return;
		}

		if (!Array.isArray(config.ignore)) {
			throw new TypeError(this.tool.msg('errors:eslintIgnoreInvalid'));
		}

		const ignorePath = configPath.parent().append('.eslintignore');
		const { ignore = [] } = config;

		this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

		fs.writeFileSync(ignorePath.path(), ignore.join('\n'));

		// Add to context so that it can be automatically cleaned up
		context.addConfigPath('eslint', ignorePath);

		// Delete the property else ESLint throws an error
		// eslint-disable-next-line no-param-reassign
		delete config.ignore;
	};
}
