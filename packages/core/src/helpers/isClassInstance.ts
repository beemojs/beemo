import { isObject } from '@boost/common';

export function isClassInstance<T>(value: unknown): value is T {
  return isObject(value) && value.constructor !== Object;
}
