import { PrettierConfig } from '@beemo/driver-prettier';
import baseConfig from '@milesj/build-tool-config/lib/configs/prettier';

const config: PrettierConfig = {
  ...baseConfig,
  arrowParens: 'always',
  ignore: ['CHANGELOG.md'],
};

export default config;
