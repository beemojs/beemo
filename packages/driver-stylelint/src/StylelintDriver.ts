import fs from 'fs';
import { ConfigContext, Driver, Path } from '@beemo/core';
import { Event } from '@boost/event';
import { StylelintArgs, StylelintConfig } from './types';

// Success: Writes warnings to stdout
// Failure: Writes failures to stdout
export class StylelintDriver extends Driver<StylelintConfig> {
	override readonly name = '@beemo/driver-stylelint';

	readonly onCreateIgnoreFile = new Event<[ConfigContext, Path, { ignore: string[] }]>(
		'create-ignore-file',
	);

	override bootstrap() {
		this.setMetadata({
			bin: 'stylelint',
			configName: '.stylelintrc.js',
			description: this.tool.msg('app:stylelintDescription'),
			title: 'stylelint',
		});

		this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
	}

	/**
	 * If an "ignore" property exists in the stylelint config, create a ".sylelintignore" file.
	 */
	private handleCreateIgnoreFile = (
		context: ConfigContext<StylelintArgs>,
		configPath: Path,
		config: StylelintConfig,
	) => {
		if (!config.ignore) {
			return;
		}

		if (!Array.isArray(config.ignore)) {
			throw new TypeError(this.tool.msg('errors:stylelintIgnoreInvalid'));
		}

		const ignorePath = configPath.parent().append('.stylelintignore');
		const { ignore } = config;

		this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

		fs.writeFileSync(ignorePath.path(), ignore.join('\n'));

		// Add to context so that it can be automatically cleaned up
		context.addConfigPath('stylelint', ignorePath);

		// eslint-disable-next-line no-param-reassign
		delete config.ignore;
	};
}
