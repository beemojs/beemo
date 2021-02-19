import { RollupConfig } from '@beemo/driver-rollup';

const config: RollupConfig = {
  input: 'src/main.ts',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
};

export default config;
