import Context from './Context';
import { Arguments } from '../types';

export interface ScaffoldOptions {
  dry: boolean;
}

export type ScaffoldParams = [string, string, string];

export default class ScaffoldContext extends Context<ScaffoldOptions, ScaffoldParams> {
  action: string;

  generator: string;

  name: string;

  constructor(
    args: Arguments<ScaffoldOptions, ScaffoldParams>,
    generator: string,
    action: string,
    name: string = '',
  ) {
    super(args);

    this.generator = generator;
    this.action = action;
    this.name = name;
  }
}
