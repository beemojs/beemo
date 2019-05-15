import fs from 'fs';
import path from 'path';
import { Event } from '@boost/event';
import { Driver, ConfigContext, ConfigArgs, Execution } from '@beemo/core';
// @ts-ignore
import ConfigOps from 'eslint/lib/config/config-ops';
import { ESLintArgs, ESLintConfig } from './types';

// Success: Writes warnings to stdout
// Failure: Writes to stdout and stderr
export default class ESLintDriver extends Driver<ESLintConfig> {
  onCreateIgnoreFile = new Event<
    [ConfigContext<ConfigArgs & ESLintArgs>, string, { ignore: string[] }]
  >('create-ignore-file');

  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc.js',
      description: this.tool.msg('app:eslintDescription'),
      filterOptions: true,
      title: 'ESLint',
    });

    this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
  }

  /**
   * ESLints merging logic does not combine arrays but replaces indices.
   * We do not want this functionality for ignore lists, so handle separately.
   */
  mergeConfig(prev: ESLintConfig, next: ESLintConfig): ESLintConfig {
    const ignore = this.doMerge(prev.ignore || [], next.ignore || []);
    const config = ConfigOps.merge(prev, next);

    if (ignore && ignore.length > 0) {
      config.ignore = ignore;
    }

    return config;
  }

  /**
   * ESLint writes warnings to stdout, so we need to display
   * both stdout and stderr on failure.
   */
  processFailure(error: Execution) {
    const { stderr, stdout } = error;

    if (stderr) {
      this.tool.logError(stderr);
    }

    if (stdout) {
      this.tool.log(stdout);
    }
  }

  /**
   * If an "ignore" property exists in the ESLint config, create an ".eslintignore" file.
   */
  private handleCreateIgnoreFile = (
    context: ConfigContext<ConfigArgs & ESLintArgs>,
    configPath: string,
    config: ESLintConfig,
  ) => {
    if (!config.ignore) {
      return;
    }

    if (!Array.isArray(config.ignore)) {
      throw new TypeError(this.tool.msg('errors:eslintIgnoreInvalid'));
    }

    const ignorePath = path.join(path.dirname(configPath), '.eslintignore');
    const { ignore = [] } = config;

    this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

    fs.writeFileSync(ignorePath, ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('eslint', ignorePath);

    // Delete the property else ESLint throws an error
    delete config.ignore;
  };
}
