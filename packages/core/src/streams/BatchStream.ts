/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Transform, TransformCallback } from 'stream';

const WAIT_THRESHOLD = 500;

export interface BatchStreamOptions {
  wait?: number;
}

export default class BatchStream extends Transform {
  bufferedBatch: Buffer | null = null;

  timeout: NodeJS.Timer | null = null;

  waitThreshold: number = 0;

  constructor(options: BatchStreamOptions = {}) {
    super();

    this.waitThreshold = options.wait || WAIT_THRESHOLD;
  }

  flush() {
    if (this.bufferedBatch) {
      this.push(this.bufferedBatch);
      this.bufferedBatch = null;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    if (this.bufferedBatch) {
      this.bufferedBatch = Buffer.concat([this.bufferedBatch, chunk]);
    } else {
      this.bufferedBatch = chunk;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.flush();
    }, this.waitThreshold);

    callback();
  }

  _flush(callback: TransformCallback) {
    this.flush();
    callback();
  }
}
