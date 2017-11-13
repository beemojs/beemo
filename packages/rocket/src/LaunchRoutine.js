/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';

const OPTION_PATTERN: RegExp = /-?-[-a-z0-9]+/ig;

export default class LaunchRoutine extends Routine {
  bootstrap() {
    const { engineName } = this.context;

    this
      .task('Filtering command options', this.filterCommandOptions)
      .task(`Running ${engineName} command`, this.runCommand);
  }

  execute(): Promise<string> {
    return this.serializeTasks();
  }

  filterCommandOptions(): Promise<string[]> {
    const { cliArgs, engine } = this.context;

    return this.executeCommand(engine.meta.bin, [engine.meta.helpOption], {
      env: engine.options.env,
    })
      .then(this.handleOutput)
      .then(output => output.match(OPTION_PATTERN))
      .then((nativeOptions) => {
        const options = [
          // Configured arguments should be first
          ...engine.options.args,
          // Generated arguments second
          // TODO
          // Manual passed arguments should override all
          ...cliArgs,
        ];

        return options.filter(option => (
          option.startsWith('-') ? nativeOptions.includes(option) : true
        ));
      })
      .catch(this.handleOutput);
  }

  handleOutput(output: *): string {
    if (output.failed && output.stderr) {
      throw new Error(output.stderr);
    }

    return output.stdout;
  }

  runCommand(args: string[]) {
    const { cliArgs, engine } = this.context;

    // console.log(cliArgs, engine.options.args, args);

    return this.executeCommand(engine.meta.bin, args, {
      env: engine.options.env,
    })
      .then(this.handleOutput)
      .then((output) => {
        if (output.stderr) {
          throw new Error(output.stderr);
        }

        // TODO Pass to renderer
        // console.log(output);

        return output.stdout;
      })
      .catch((error) => {
        // console.log(error);
      });
  }
}
