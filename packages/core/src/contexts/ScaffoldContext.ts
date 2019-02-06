import Context from './Context';
import { Arguments } from '../types';

export interface ScaffoldArgs {
  action: string;
  generator: string;
  dry: boolean;
}

export default class ScaffoldContext<T = ScaffoldArgs> extends Context<T> {
  action: string;

  generator: string;

  constructor(args: Arguments<T>, generator: string, action: string) {
    super(args);

    this.generator = generator;
    this.action = action;
  }
}
