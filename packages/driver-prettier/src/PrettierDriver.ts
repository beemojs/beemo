import fs from 'fs';
import { Event } from '@boost/event';
import { Driver, ConfigContext, Path, ExecutionError } from '@beemo/core';
import { PrettierConfig } from './types';

// Success: Writes file list to stdout
// Failure: Writes to stderr for no files found and syntax errors
export default class PrettierDriver extends Driver<PrettierConfig> {
  name = '@beemo/driver-prettier';

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

  extractErrorMessage(error: ExecutionError): string {
    if (error.message.includes('SyntaxError')) {
      return error.message.split(/|\s+$/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }

  /**
   * If an "ignore" property exists in the Prettier config, create an ".prettierconfig" file.
   */
  private handleCreateIgnoreFile = (
    context: ConfigContext,
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
