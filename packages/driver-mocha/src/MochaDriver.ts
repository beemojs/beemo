/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Driver } from '@beemo/core';
import { MochaConfig, ReporterOptions } from './types';

// Success: Writes passed tests to stdout
// Failure: Writes failed tests to stdout
export default class MochaDriver extends Driver<MochaConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'mocha',
      configName: 'mocha.opts',
      configOption: '--opts',
      description: this.tool.msg('app:mochaDriver'),
      title: 'Mocha',
      useConfigOption: true,
      watchOptions: ['-w', '--watch'],
    });
  }

  formatConfig(data: MochaConfig): string {
    const output: string[] = [];

    Object.keys(data).forEach(key => {
      const option =
        key === 'es_staging' || key === 'use_strict' ? `--${key}` : `--${key.replace(/_/gu, '-')}`;
      const value = data[key];
      const type = typeof value;

      if (key === 'reporterOptions') {
        output.push(`${option} ${this.formatReporterOptions(value)}`);
      } else if (type === 'boolean') {
        output.push(option);
      } else if (Array.isArray(value)) {
        if (key === 'globals') {
          output.push(value.join(', '));
        } else {
          value.forEach(v => {
            output.push(`${option} ${v}`);
          });
        }
      } else {
        output.push(`${option} ${value}`);
      }
    });

    return output.join('\n');
  }

  formatReporterOptions(options: ReporterOptions): string {
    return Object.keys(options)
      .map(key => `${key}=${options[key]}`)
      .join(',');
  }
}
