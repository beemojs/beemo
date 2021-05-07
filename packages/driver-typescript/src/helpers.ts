import fs from 'fs';
import { Path } from '@beemo/core';

export function join(...parts: string[]): string {
  return new Path(...parts).path();
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
