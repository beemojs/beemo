import { PrettierConfig } from '@beemo/driver-prettier';
import baseConfig from '@milesj/build-tool-config/src/configs/prettier';

const config: PrettierConfig = {
  ...baseConfig,
  ignore: baseConfig.ignore!.concat(['CHANGELOG.md']),
};

export default config;
