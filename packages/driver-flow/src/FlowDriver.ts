import { Driver, Execution } from '@beemo/core';
import { FlowConfig, LintsConfig, OptionsConfig } from './types';

// Success: Writes "Found 0 errors" to stdout and server output to stderr
// Failure: Writes file list to stdout and server output to stderr
export class FlowDriver extends Driver<FlowConfig> {
  readonly name = '@beemo/driver-flow';

  bootstrap() {
    this.setMetadata({
      bin: 'flow',
      configName: '.flowconfig',
      description: this.tool.msg('app:flowDescription'),
      title: 'Flow',
      // watchOptions: ['server'],
    });
  }

  formatConfig(data: FlowConfig): string {
    const output: string[] = [];

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof FlowConfig];

      if (!value) {
        return;
      }

      output.push(`[${key}]`);

      switch (key) {
        default:
          if (Array.isArray(value)) {
            output.push(...value.map((v) => String(v)));
          } else if (value) {
            output.push(String(value));
          }
          break;
        case 'lints':
          output.push(...this.formatLintsSection(value as LintsConfig));
          break;
        case 'options':
          output.push(...this.formatOptionsSection(value as OptionsConfig));
          break;
      }

      output.push('');
    });

    return output.join('\n');
  }

  formatLintsSection(lints: LintsConfig): string[] {
    const output: string[] = [];

    Object.keys(lints).forEach((key) => {
      let value = lints[key];

      if (value === 0) {
        value = 'off';
      } else if (value === 1) {
        value = 'warn';
      } else if (value === 2) {
        value = 'error';
      }

      output.push(`${key.replaceAll('_', '-')}=${String(value)}`);
    });

    return output;
  }

  formatOption(value: unknown, quote: boolean = false): string {
    let option = value;

    // http://caml.inria.fr/pub/docs/manual-ocaml/libref/Str.html#TYPEregexp
    option =
      value instanceof RegExp
        ? value.source.replace(/\|/gu, '\\|').replaceAll('(', '\\(').replaceAll(')', '\\)')
        : String(value);

    return quote ? `'${option}'` : String(option);
  }

  formatOptionsSection(options: OptionsConfig): string[] {
    const output: string[] = [];

    Object.keys(options).forEach((key) => {
      const value = options[key as keyof OptionsConfig];

      if (!value) {
        return;
      }

      // Multiple values
      if (Array.isArray(value)) {
        value.forEach((val) => {
          output.push(`${key}=${this.formatOption(val)}`);
        });

        // Mapped objects
      } else if (typeof value === 'object' && !(value instanceof RegExp)) {
        Object.keys(value).forEach((pattern) => {
          output.push(
            `${key}=${this.formatOption(pattern, true)} -> ${this.formatOption(
              value[pattern],
              true,
            )}`,
          );
        });

        // Primitives
      } else {
        output.push(`${key}=${this.formatOption(value)}`);
      }
    });

    return output;
  }

  // https://github.com/facebook/flow/blob/e466b0ee519622a8977e89708be156a73e570ef0/hack/utils/exit_status.ml#L78
  // https://github.com/facebook/flow/blob/e466b0ee519622a8977e89708be156a73e570ef0/src/common/flowExitStatus.ml#L54
  processFailure(error: Execution) {
    if (error.exitCode === 2) {
      this.setOutput('stderr', error.stdout); // Command failures
    } else {
      super.processFailure(error);
    }
  }
}
