import { JestConfig } from '@beemo/driver-jest';
import baseConfig from '@milesj/build-tool-config/lib/configs/jest';

const config: JestConfig = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['core/src/streams'],
  testPathIgnorePatterns: ['integration'],
};

export default config;
