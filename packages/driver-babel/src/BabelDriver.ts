import rimraf from 'rimraf';
import { Driver, DriverContext, DriverContextOptions, Path } from '@beemo/core';
import { BabelArgs, BabelConfig } from './types';

// Success: Writes file list to stdout
// Failure: Throws SyntaxError to stderr
export default class BabelDriver extends Driver<BabelConfig> {
  readonly name = '@beemo/driver-babel';

  bootstrap() {
    this.setMetadata({
      bin: 'babel',
      configName: 'babel.config.js',
      configOption: '--config-file',
      description: this.tool.msg('app:babelDescription'),
      title: 'Babel',
      watchOptions: ['-w', '--watch'],
    });

    this.setCommandOptions({
      clean: {
        default: false,
        description: this.tool.msg('app:babelCleanOption'),
        type: 'boolean',
      },
    });

    this.onBeforeExecute.listen(this.handleCleanTarget);
  }

  extractErrorMessage(error: { message: string }): string {
    if (error.message.includes('SyntaxError')) {
      return error.message.split(/\s+at/u, 1)[0].trim();
    }

    return super.extractErrorMessage(error);
  }

  /**
   * Automatically clean the target folder if --out-dir is used.
   */
  private handleCleanTarget = (context: DriverContext<BabelArgs & DriverContextOptions>) => {
    const outDir = context.getRiskyOption('outDir');

    if (context.getRiskyOption('clean') !== null && typeof outDir === 'string' && outDir) {
      rimraf.sync(Path.resolve(outDir).path());
    }

    return Promise.resolve();
  };
}
