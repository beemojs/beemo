import { isObject } from '@boost/common';

export default function isClassInstance<T>(value: unknown): value is T {
  return isObject(value) && value.constructor !== Object;
}
