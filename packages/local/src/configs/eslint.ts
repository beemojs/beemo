import { ESLintConfig } from '@beemo/driver-eslint';
import baseConfig from '@milesj/build-tool-config/src/configs/eslint';

const config: ESLintConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'function-paren-newline': 'off',
    'no-param-reassign': 'off',
    'import/first': 'off',
  },
};

export default config;
