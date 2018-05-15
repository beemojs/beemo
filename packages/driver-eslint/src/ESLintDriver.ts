/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import { Driver, DriverContext } from '@beemo/core';
// @ts-ignore
import ConfigOps from 'eslint/lib/config/config-ops';
import { ESLintConfig } from './types';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout
export default class ESLintDriver extends Driver<ESLintConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc.js',
      description: 'Lint files with ESLint',
      filterOptions: true,
      title: 'ESLint',
    });

    this.on('eslint.create-config-file', this.handleCreateIgnoreFile);
  }

  mergeConfig(prev: ESLintConfig, next: ESLintConfig): ESLintConfig {
    return ConfigOps.merge(prev, next);
  }

  /**
   * If an "ignore" property exists in the ESLint config, create an ".eslintignore" file.
   */
  handleCreateIgnoreFile = (configPath: string, config: ESLintConfig) => {
    if (!config.ignore) {
      return;
    }

    if (!Array.isArray(config.ignore)) {
      throw new TypeError('Ignore configuration must be an array of strings.');
    }

    const ignorePath = path.join(path.dirname(configPath), '.eslintignore');

    fs.writeFileSync(ignorePath, config.ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    this.context.configPaths.push(ignorePath);

    // Delete the property else ESLint throws an error
    delete config.ignore;
  };
}
