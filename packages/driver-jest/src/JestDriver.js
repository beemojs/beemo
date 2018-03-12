/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

import type { Execution } from '@beemo/core';

// Success: Writes passed tests to stderr (Bug? https://github.com/facebook/jest/issues/5064)
// Failure: Writes failed tests to stderr
export default class JestDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: 'jest.json',
      dependencies: ['babel'],
      description: 'Unit test files with Jest.',
      filterOptions: true,
      title: 'Jest',
    });
  }

  // Temporary!
  handleSuccess(response: Execution) {
    const out = (response.stdout || response.stderr).trim();

    if (out) {
      this.tool.log(out);
    }
  }
}
