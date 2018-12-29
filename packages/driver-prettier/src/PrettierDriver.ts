/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import { Driver, DriverArgs, DriverContext } from '@beemo/core';
import { PrettierArgs, PrettierConfig } from './types';

// Success: Writes file list to stdout
// Failure: Writes to stderr for no files found and syntax errors
export default class PrettierDriver extends Driver<PrettierConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: 'prettier.config.js',
      description: this.tool.msg('app:prettierDescription'),
      filterOptions: true,
      title: 'Prettier',
    });

    this.on('prettier.create-config-file', this.handleCreateIgnoreFile);
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

    fs.writeFileSync(ignorePath, config.ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('prettier', ignorePath);

    // Delete the property
    delete config.ignore;
  };
}
