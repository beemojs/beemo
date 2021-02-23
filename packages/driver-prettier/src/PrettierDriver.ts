import fs from 'fs';
import { ConfigContext, Driver, Path } from '@beemo/core';
import { Event } from '@boost/event';
import { PrettierArgs, PrettierConfig } from './types';

// Success: Writes formatted files to stdout
// Failure: Writes to stderr for no files found and syntax errors
export default class PrettierDriver extends Driver<PrettierConfig> {
  readonly name = '@beemo/driver-prettier';

  readonly onCreateIgnoreFile = new Event<[ConfigContext, Path, { ignore: string[] }]>(
    'create-ignore-file',
  );

  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: 'prettier.config.js',
      description: this.tool.msg('app:prettierDescription'),
      title: 'Prettier',
    });

    this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
  }

  /**
   * If an "ignore" property exists in the Prettier config, create an ".prettierconfig" file.
   */
  private handleCreateIgnoreFile = (
    context: ConfigContext<PrettierArgs>,
    configPath: Path,
    config: PrettierConfig,
  ) => {
    if (!config.ignore) {
      return;
    }

    if (!Array.isArray(config.ignore)) {
      throw new TypeError(this.tool.msg('errors:prettierIgnoreInvalid'));
    }

    const ignorePath = configPath.parent().append('.prettierignore');
    const { ignore = [] } = config;

    this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

    fs.writeFileSync(ignorePath.path(), ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('prettier', ignorePath);

    // Delete the property
    delete config.ignore;
  };
}
