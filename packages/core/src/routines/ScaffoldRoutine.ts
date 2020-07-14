import { engine } from 'hygen';
import { Path, Blueprint, Predicates, Bind } from '@boost/common';
import { Routine } from '@boost/pipeline';
import Tool from '../Tool';
import ScaffoldContext from '../contexts/ScaffoldContext';
import { RoutineOptions } from '../types';

export default class ScaffoldRoutine extends Routine<unknown, unknown, RoutineOptions> {
  blueprint({ instance }: Predicates): Blueprint<RoutineOptions> {
    return {
      tool: instance(Tool)
        .required()
        .notNullable(),
    };
  }

  execute(context: ScaffoldContext) {
    return this.createWaterfallPipeline(context)
      .pipe(this.options.tool.msg('app:scaffoldRunGenerator'), this.runGenerator)
      .run();
  }

  /**
   * Execute the hygen scaffolding generator.
   */
  @Bind()
  async runGenerator(context: ScaffoldContext) {
    const { tool } = this.options;
    const args = [context.generator, context.action];
    const moduleName = tool.config.module;
    const searchName = moduleName.includes('/') ? moduleName.split('/')[1] : moduleName;
    let modulePath = require.resolve(moduleName);

    // Index files may be nested, so we need to slice and work around it
    modulePath = modulePath.slice(0, modulePath.lastIndexOf(searchName) + searchName.length);

    try {
      await engine(context.argv, {
        // @ts-ignore Broken upstream
        createPrompter: /* istanbul ignore next */ () => ({ prompt: this.handlePrompt }),
        cwd: tool.cwd.path(),
        debug: tool.config.debug,
        exec: this.handleExec,
        // logger: new Logger(this.handleLog),
        templates: new Path(modulePath, 'templates').path(),
      });
    } catch (error) {
      // Intercept hygen error to provide a better error message
      if (error.message.startsWith("I can't find action")) {
        throw new Error(tool.msg('errors:scaffoldNoTemplates', { path: args.join('/') }));
      }

      throw error;
    }
  }

  /**
   * Handle shell executions from hygen.
   */
  private handleExec = (action: string, input: string) =>
    this.executeCommand(action, [], {
      input,
      shell: true,
    });

  /**
   * Pipe a message from hygen to boost.
   */
  private handleLog = (message: string) => {
    if (message && message.trim()) {
      console.log(message);
    }
  };

  /**
   * Temporary solution until boost supports prompts.
   */
  private handlePrompt = /* istanbul ignore next */ () => Promise.resolve({ overwrite: true });
}
