import { engine } from 'hygen';
// @ts-ignore
import Logger from 'hygen/lib/logger';
import { Path } from '@boost/common';
import { Routine } from '@boost/core';
import Beemo from '../Beemo';
import ScaffoldContext from '../contexts/ScaffoldContext';

export default class ScaffoldRoutine extends Routine<ScaffoldContext, Beemo> {
  bootstrap() {
    this.task(this.tool.msg('app:scaffoldRunGenerator'), this.runGenerator);
  }

  execute(context: ScaffoldContext) {
    return this.serializeTasks(this.tool.config.module);
  }

  /**
   * Execute the hygen scaffolding generator.
   */
  async runGenerator(context: ScaffoldContext, moduleName: string) {
    const { tool } = this;
    const args = [context.generator, context.action];
    const searchName = moduleName.includes('/') ? moduleName.split('/')[1] : moduleName;
    let modulePath = require.resolve(moduleName);

    // Index files may be nested, so we need to slice and work around it
    modulePath = modulePath.slice(0, modulePath.lastIndexOf(searchName) + searchName.length);

    try {
      return await engine(context.argv, {
        // @ts-ignore Broken upstream
        createPrompter: /* istanbul ignore next */ () => ({ prompt: this.handlePrompt }),
        cwd: tool.options.root,
        debug: tool.config.debug,
        exec: this.handleExec,
        logger: new Logger(this.handleLog),
        templates: new Path(modulePath, 'templates').path(),
      });
    } catch (error) {
      // Intercept hygen error to provide a better error message
      if (error.message.startsWith("I can't find action")) {
        throw new Error(this.tool.msg('errors:scaffoldNoTemplates', { path: args.join('/') }));
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
      this.tool.console.log(message);
    }
  };

  /**
   * Temporary solution until boost supports prompts.
   */
  private handlePrompt = /* istanbul ignore next */ () => Promise.resolve({ overwrite: true });
}
