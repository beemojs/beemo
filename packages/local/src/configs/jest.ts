import { JestConfig } from '@beemo/driver-jest';
import baseConfig from '@milesj/build-tool-config/lib/configs/jest';

const config: JestConfig = {
  ...baseConfig,
  coveragePathIgnorePatterns: [
    'core/lib', // This is being included for some reason
    'core/src/streams',
  ],
  testPathIgnorePatterns: ['integration'],
};

export default config;
