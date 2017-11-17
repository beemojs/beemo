/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from 'rocket';

import type { Execution } from 'rocket';

export default class JestEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: 'jest.json',
      dependencies: ['babel'],
      description: 'Unit test files with Jest.',
      title: 'Jest',
    });
  }

  handleFailure({ stderr }: Execution) {
    this.tool.logError(stderr);
  }

  handleSuccess({ stdout }: Execution) {
    if (stdout) {
      this.tool.log(stdout);
    }
  }
}
