import baseConfig from '@beemo/config-jest';
import { JestConfig } from '@beemo/driver-jest';

const config: JestConfig = {
  ...baseConfig,
  coveragePathIgnorePatterns: [
    'core/lib', // This is being included for some reason
    'core/src/streams',
  ],
  testPathIgnorePatterns: ['integration'],
};

export default config;
