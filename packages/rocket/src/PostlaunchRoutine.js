/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Routine } from 'boost';

export default class PostlaunchRoutine extends Routine {
  bootstrap() {
    this
      .task('Deleting temporary config file', this.deleteConfigFile);
  }
}
