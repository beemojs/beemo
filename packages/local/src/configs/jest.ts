import { JestConfig } from '@beemo/driver-jest';
import baseConfig from '@milesj/build-tool-config/lib/configs/jest';

const config: JestConfig = {
  ...baseConfig,
  testPathIgnorePatterns: ['integration'],
};

export default config;
