import { Configuration, LinterOptions } from 'stylelint';

export interface StylelintConfig extends Partial<Configuration> {
  ignore?: string[];
}

export type StylelintArgs = LinterOptions;
