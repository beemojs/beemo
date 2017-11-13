/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Engine } from 'rocket';

export default class JestEngine extends Engine {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      dependencies: ['babel'],
      description: 'Unit test files with Jest.',
      fileName: 'jest.json',
      title: 'Jest',
    });
  }
}
