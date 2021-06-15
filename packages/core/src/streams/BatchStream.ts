/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable no-underscore-dangle */

import { Transform, TransformCallback } from 'stream';

const WAIT_THRESHOLD = 500;

export interface BatchStreamOptions {
	wait?: number;
}

export class BatchStream extends Transform {
	bufferedBatch: Buffer | null = null;

	timeout: NodeJS.Timeout | null = null;

	waitThreshold: number = 0;

	constructor(options: BatchStreamOptions = {}) {
		super();

		this.waitThreshold = options.wait ?? WAIT_THRESHOLD;
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

	override _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
		this.bufferedBatch = this.bufferedBatch ? Buffer.concat([this.bufferedBatch, chunk]) : chunk;

		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout(() => {
			this.flush();
		}, this.waitThreshold);

		callback();
	}

	override _flush(callback: TransformCallback) {
		this.flush();
		callback();
	}
}
