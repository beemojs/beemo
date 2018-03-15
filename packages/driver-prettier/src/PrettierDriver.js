/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs';
import path from 'path';
import { Driver } from '@beemo/core';

// Success: Writes file list to stdout
// Failure: Writes to stderr for no files found and syntax errors
export default class PrettierDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'prettier',
      configName: '.prettierrc',
      description: 'Format code with Prettier.',
      filterOptions: true,
      title: 'Prettier',
    });

    this.on('prettier.create-config-file', this.handleCreateIgnoreFile);
  }

  /**
   * If an "ignore" property exists in the Prettier config, create an ".prettierconfig" file.
   */
  handleCreateIgnoreFile = (event: Event, configPath: string, config: Object) => {
    if (config.ignore) {
      if (!Array.isArray(config.ignore)) {
        throw new TypeError('Ignore configuration must be an array of strings.');
      }

      const ignorePath = path.join(path.dirname(configPath), '.prettierignore');

      fs.writeFileSync(ignorePath, config.ignore.join('\n'));

      // Add to context so that it can be automatically cleaned up
      this.context.configPaths.push(ignorePath);

      // Delete the property
      // eslint-disable-next-line no-param-reassign
      delete config.ignore;
    }
  };
}
