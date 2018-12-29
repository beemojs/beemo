/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import path from 'path';
import rimraf from 'rimraf';
import { Driver, DriverArgs, DriverContext } from '@beemo/core';
import { TypeScriptArgs, TypeScriptConfig } from './types';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'tsc',
      configName: 'tsconfig.json',
      configOption: '',
      description: this.tool.msg('app:typescriptDescription'),
      filterOptions: true,
      helpOption: '--help --all',
      title: 'TypeScript',
      watchOptions: ['-w', '--watch'],
      workspaceStrategy: 'copy',
    });

    this.setCommandOptions({
      clean: {
        boolean: true,
        default: false,
        description: this.tool.msg('app:typescriptCleanOption'),
      },
    });

    this.on('typescript.before-execute', this.handleCleanTarget);
  }

  /**
   * Automatically clean the target folder if `outDir` is used.
   */
  handleCleanTarget = ({ args }: DriverContext<DriverArgs & TypeScriptArgs>) => {
    const outDir =
      args.outDir || (this.config.compilerOptions && this.config.compilerOptions.outDir);

    if (args.clean && outDir) {
      rimraf.sync(path.resolve(outDir));
    }
  };
}
