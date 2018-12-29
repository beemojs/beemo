/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Routine } from '@boost/core';
import { Options } from 'yargs-parser';
import ScriptContext from './contexts/ScriptContext';
import { BeemoTool } from './types';

export default class Script extends Routine<ScriptContext, BeemoTool> {
  /**
   * Define a configuration object to parse args with.
   */
  args(): Options {
    return {};
  }
}
