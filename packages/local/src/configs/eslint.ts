import { ESLintConfig } from '@beemo/driver-eslint';
import baseConfig from '@milesj/build-tool-config/configs/eslint';

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
