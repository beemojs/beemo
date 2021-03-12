import rimraf from 'rimraf';
import { Blueprint, Driver, DriverContext, Path, Predicates } from '@beemo/core';
import syncProjectRefs from './commands/syncProjectRefs';
import { TypeScriptConfig, TypeScriptOptions } from './types';

// Success: Writes nothing to stdout or stderr
// Failure: Writes to stdout on syntax and type error
export default class TypeScriptDriver extends Driver<TypeScriptConfig, TypeScriptOptions> {
  readonly name = '@beemo/driver-typescript';

  blueprint(preds: Predicates): Blueprint<TypeScriptOptions> {
    const { bool, string } = preds;

    return {
      ...super.blueprint(preds),
      buildFolder: string('lib'),
      declarationOnly: bool(),
      globalTypes: bool(true),
      localTypes: bool(true),
      srcFolder: string('src'),
      testsFolder: string('tests'),
      typesFolder: string('types'),
    };
  }

  bootstrap() {
    this.setMetadata({
      bin: 'tsc',
      commandOptions: {
        clean: {
          default: false,
          description: this.tool.msg('app:typescriptCleanOption'),
          type: 'boolean',
        },
      },
      configName: 'tsconfig.json',
      configOption: '',
      description: this.tool.msg('app:typescriptDescription'),
      helpOption: '--help --all',
      title: 'TypeScript',
      watchOptions: ['-w', '--watch'],
      workspaceStrategy: 'copy',
    });

    this.registerCommand(
      'sync-project-refs',
      { description: this.tool.msg('app:typescriptSyncProjectRefsDescription') },
      syncProjectRefs,
    );

    this.onBeforeExecute.listen(this.handleCleanTarget);
  }

  /**
   * Automatically clean the target folder if `outDir` and `--clean` is used.
   */
  private handleCleanTarget = (context: DriverContext) => {
    const outDir = context.getRiskyOption('outDir', true) || this.config.compilerOptions?.outDir;

    if (context.getRiskyOption('clean') && typeof outDir === 'string' && outDir) {
      rimraf.sync(Path.resolve(outDir).path());
    }

    return Promise.resolve();
  };
}
