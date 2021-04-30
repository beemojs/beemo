import baseConfig from '@beemo/config-jest';
import { JestConfig } from '@beemo/driver-jest';

const config: JestConfig = {
  ...baseConfig,
  coveragePathIgnorePatterns: [
    'cli/src/commands',
    'core/src/streams',
    'driver-*/src/index.ts',
    'local/',
    'website/',
  ],
  testPathIgnorePatterns: ['integration'],
};

export default config;
