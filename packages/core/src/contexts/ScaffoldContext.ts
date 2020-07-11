import Context from './Context';
import { Arguments } from '../types';

export interface ScaffoldContextOptions {
  dry: boolean;
}

export type ScaffoldContextParams = [string, string, string];

export default class ScaffoldContext extends Context<
  ScaffoldContextOptions,
  ScaffoldContextParams
> {
  action: string;

  generator: string;

  name: string;

  constructor(
    args: Arguments<ScaffoldContextOptions, ScaffoldContextParams>,
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
