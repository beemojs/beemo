/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

// Success: Writes passed tests to stdout
// Failure: Writes failed tests to stdout
export default class MochaDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'mocha',
      configName: 'mocha.opts',
      configOption: '--opts',
      description: 'Unit test files with Mocha.',
      title: 'Mocha',
      useConfigOption: true,
    });
  }

  formatConfig(data: Object): string {
    const output = [];

    Object.keys(data).forEach(key => {
      const option =
        key === 'es_staging' || key === 'use_strict' ? `--${key}` : `--${key.replace(/_/g, '-')}`;
      const value = data[key];
      const type = typeof value;

      if (key === 'reporterOptions') {
        output.push(`${option} ${this.formatReporterOptions(value)}`);
      } else if (type === 'boolean') {
        output.push(option);
      } else if (Array.isArray(value)) {
        output.push(`${option} ${value.join(',')}`);
      } else {
        output.push(`${option} ${value}`);
      }
    });

    return output.join('\n');
  }

  formatReporterOptions(options: Object): string {
    return Object.keys(options)
      .map(key => `${key}=${options[key]}`)
      .join(',');
  }
}
