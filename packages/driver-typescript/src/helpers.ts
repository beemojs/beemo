import fs from 'fs';
import { Path } from '@beemo/core';

// tsconfig.json uses forward slashes, so we have to manually handle this
export function toForwardSlashes(part: string): string {
	return part.replace(/\\/g, '/');
}

export function join(...parts: string[]): string {
	return toForwardSlashes(new Path(...parts).path());
}

export async function writeFile(path: Path, data: unknown): Promise<void> {
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line promise/prefer-await-to-callbacks
		fs.writeFile(path.path(), JSON.stringify(data, null, 2), (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}
