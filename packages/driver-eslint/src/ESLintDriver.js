/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import fs from 'fs';
import path from 'path';
import { Driver } from '@beemo/core';
import ConfigOps from 'eslint/lib/config/config-ops';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout
export default class ESLintDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc',
      description: 'Lint files with ESLint.',
      title: 'ESLint',
    });

    this.on('eslint.create-config-file', this.handleCreateIgnoreFile);
  }

  mergeConfig(prev: Object, next: Object): Object {
    return ConfigOps.merge(prev, next);
  }

  /**
   * If an "ignore" property exists in the ESLint config, create an ".eslintignore" file.
   */
  handleCreateIgnoreFile = (event: Event, configPath: string, config: Object) => {
    if (config.ignore) {
      if (!Array.isArray(config.ignore)) {
        throw new TypeError('Ignore configuration must be an array of strings.');
      }

      const ignorePath = path.join(path.dirname(configPath), '.eslintignore');

      fs.writeFileSync(ignorePath, config.ignore.join('\n'));

      // Add to context so that it can be automatically cleaned up
      this.context.configPaths.push(ignorePath);

      // Delete the property else ESLint throws an error
      // eslint-disable-next-line no-param-reassign
      delete config.ignore;
    }
  };
}
