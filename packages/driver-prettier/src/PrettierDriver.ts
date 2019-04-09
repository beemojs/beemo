import fs from 'fs';
import path from 'path';
import { Driver, DriverArgs, DriverContext } from '@beemo/core';
import { PrettierArgs, PrettierConfig } from './types';

// Success: Writes file list to stdout
// Failure: Writes to stderr for no files found and syntax errors
export default class PrettierDriver extends Driver<PrettierConfig> {
  onCreateIgnoreFile = new Event<[DriverContext, string, { ignore: string[] }]>(
    'create-ignore-file',
  );

  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: 'prettier.config.js',
      description: this.tool.msg('app:prettierDescription'),
      filterOptions: true,
      title: 'Prettier',
    });

    this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
  }

  extractErrorMessage(error: Error): string {
    if (error.message.includes('SyntaxError')) {
      return error.message.split(/|\s+$/u, 1)[0];
    }

    return super.extractErrorMessage(error);
  }

  /**
   * If an "ignore" property exists in the Prettier config, create an ".prettierconfig" file.
   */
  handleCreateIgnoreFile = (
    context: DriverContext<DriverArgs & PrettierArgs>,
    configPath: string,
    config: PrettierConfig,
  ) => {
    if (!config.ignore) {
      return;
    }

    if (!Array.isArray(config.ignore)) {
      throw new TypeError(this.tool.msg('errors:prettierIgnoreInvalid'));
    }

    const ignorePath = path.join(path.dirname(configPath), '.prettierignore');
    const { ignore = [] } = config;

    this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

    fs.writeFileSync(ignorePath, ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('prettier', ignorePath);

    // Delete the property
    delete config.ignore;
  };
}
