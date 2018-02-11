/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

import type { Execution } from '@beemo/core';

// Success: Writes no errors message to stdout and server output to stderr
// Failure: Writes file list to stdout and server output to stderr
export default class FlowDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'flow',
      configName: '.flowconfig',
      description: 'Type check files with Flow.',
      title: 'Flow',
    });
  }

  formatFile(data: Object): string {
    const output = [];

    Object.keys(data).forEach(key => {
      const value = data[key];

      if (!value) {
        return;
      }

      output.push(`[${key}]`);

      switch (key) {
        default:
          output.push(...value.map(v => String(v)));
          break;
        case 'lints':
          output.push(...this.formatLintsSection(value));
          break;
        case 'options':
          output.push(...this.formatOptionsSection(value));
          break;
        case 'version':
          if (value) {
            output.push(String(value));
          }
          break;
      }

      output.push('');
    });

    return output.join('\n');
  }

  formatLintsSection(lints: Object): string[] {
    const output = [];

    Object.keys(lints).forEach(key => {
      let value = lints[key];

      if (value === 0) {
        value = 'off';
      } else if (value === 1) {
        value = 'warn';
      } else if (value === 2) {
        value = 'error';
      }

      output.push(`${key.replace(/_/g, '-')}=${String(value)}`);
    });

    return output;
  }

  formatOption(value: *, quote: boolean = false): string {
    let option = value;

    // http://caml.inria.fr/pub/docs/manual-ocaml/libref/Str.html#TYPEregexp
    if (value instanceof RegExp) {
      option = value.source
        .replace(/\|/g, '\\|')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
    } else {
      option = String(value);
    }

    return quote ? `'${option}'` : option;
  }

  formatOptionsSection(options: Object): string[] {
    const output = [];

    Object.keys(options).forEach(key => {
      const value = options[key];

      // Multiple values
      if (Array.isArray(value)) {
        value.forEach(val => {
          output.push(`${key}=${this.formatOption(val)}`);
        });

        // Mapped objects
      } else if (typeof value === 'object' && value.constructor === Object) {
        Object.keys(value).forEach(pattern => {
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
  handleFailure(error: Execution) {
    if (error.code === 2) {
      this.tool.logError(error.stdout); // Command failures
    } else {
      super.handleFailure(error);
    }
  }
}
