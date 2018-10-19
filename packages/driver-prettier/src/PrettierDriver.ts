/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import { Driver, DriverContext } from '@beemo/core';
import { PrettierConfig } from './types';

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

  /**
   * If an "ignore" property exists in the Prettier config, create an ".prettierconfig" file.
   */
  handleCreateIgnoreFile = (context: DriverContext, configPath: string, config: PrettierConfig) => {
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
