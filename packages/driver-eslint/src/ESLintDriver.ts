import fs from 'fs';
import { Event } from '@boost/event';
import { Driver, ConfigContext, Execution, Path } from '@beemo/core';
import { ESLintConfig } from './types';

// Success: Writes warnings to stdout
// Failure: Writes to stdout and stderr
export default class ESLintDriver extends Driver<ESLintConfig> {
  name = '@beemo/driver-eslint';

  readonly onCreateIgnoreFile = new Event<[ConfigContext, Path, { ignore: string[] }]>(
    'create-ignore-file',
  );

  bootstrap() {
    this.setMetadata({
      bin: 'eslint',
      configName: '.eslintrc.js',
      description: this.tool.msg('app:eslintDescription'),
      title: 'ESLint',
    });

    this.onCreateConfigFile.listen(this.handleCreateIgnoreFile);
  }

  /**
   * ESLint writes warnings to stdout, so we need to display
   * both stdout and stderr on failure.
   */
  processFailure(error: Execution) {
    // TODO
    // const { stderr, stdout } = error;
    // if (stderr) {
    //   this.tool.console.logError(stderr);
    // }
    // if (stdout) {
    //   this.tool.console.log(stdout);
    // }
  }

  /**
   * If an "ignore" property exists in the ESLint config, create an ".eslintignore" file.
   */
  private handleCreateIgnoreFile = (
    context: ConfigContext,
    configPath: Path,
    config: ESLintConfig,
  ) => {
    if (!config.ignore) {
      return;
    }

    if (!Array.isArray(config.ignore)) {
      throw new TypeError(this.tool.msg('errors:eslintIgnoreInvalid'));
    }

    const ignorePath = configPath.parent().append('.eslintignore');
    const { ignore = [] } = config;

    this.onCreateIgnoreFile.emit([context, ignorePath, { ignore }]);

    fs.writeFileSync(ignorePath.path(), ignore.join('\n'));

    // Add to context so that it can be automatically cleaned up
    context.addConfigPath('eslint', ignorePath);

    // Delete the property else ESLint throws an error
    delete config.ignore;
  };
}
