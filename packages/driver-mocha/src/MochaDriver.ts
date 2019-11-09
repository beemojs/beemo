import { Driver } from '@beemo/core';
import { MochaConfig } from './types';

// Success: Writes passed tests to stdout
// Failure: Writes failed tests to stdout
export default class MochaDriver extends Driver<MochaConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'mocha',
      configName: '.mocharc.js',
      configOption: '--config',
      description: this.tool.msg('app:mochaDriver'),
      title: 'Mocha',
      useConfigOption: true,
      watchOptions: ['-w', '--watch'],
    });
  }
}
